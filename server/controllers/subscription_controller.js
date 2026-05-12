const crypto = require("crypto");
const midtransClient = require("midtrans-client");
const prisma = require("../lib/prisma");

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

function addMonths(date, months) {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

function buildOrderId(tenantId) {
  return `SUBS-${tenantId}-${Date.now()}`;
}

function normalizePaymentStatus(transactionStatus) {
  if (transactionStatus === "settlement" || transactionStatus === "capture") {
    return "PAID";
  }
  if (transactionStatus === "pending") {
    return "PENDING";
  }
  if (transactionStatus === "expire") {
    return "EXPIRED";
  }
  if (transactionStatus === "cancel") {
    return "CANCELED";
  }
  if (transactionStatus === "deny") {
    return "FAILED";
  }
  return "FAILED";
}

function verifySignature(payload) {
  if (!serverKey) {
    return false;
  }

  const signatureInput = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
  const signature = crypto
    .createHash("sha512")
    .update(signatureInput)
    .digest("hex");

  return signature === payload.signature_key;
}

exports.listPlans = async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    });

    res.json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const { tenantId } = req.userData;

    const subscription = await prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { endDate: "desc" },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkoutSubscription = async (req, res) => {
  try {
    const { tenantId } = req.userData;
    const { planId, paymentType = "bank_transfer", bank = "bca" } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }

    if (!serverKey) {
      return res
        .status(500)
        .json({ message: "Midtrans server key is not configured" });
    }

    if (paymentType !== "bank_transfer") {
      return res
        .status(400)
        .json({ message: "Only bank_transfer is supported for now" });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (plan.price <= 0) {
      const subscription = await upsertSubscription(tenantId, plan.id);
      return res.status(200).json({
        message: "Subscription activated",
        subscription,
      });
    }

    const orderId = buildOrderId(tenantId);
    const grossAmount = Math.round(plan.price);

    const chargeParams = {
      payment_type: paymentType,
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      bank_transfer: {
        bank,
      },
    };

    const chargeResponse = await coreApi.charge(chargeParams);

    const payment = await prisma.subscriptionPayment.create({
      data: {
        tenantId,
        planId: plan.id,
        orderId,
        grossAmount,
        paymentType,
        status: normalizePaymentStatus(chargeResponse.transaction_status),
        transactionId: chargeResponse.transaction_id || null,
        transactionStatus: chargeResponse.transaction_status || null,
        gatewayResponse: chargeResponse,
      },
    });

    res.status(201).json({
      message: "Payment created",
      orderId: payment.orderId,
      paymentType: payment.paymentType,
      transactionStatus: payment.transactionStatus,
      vaNumbers: chargeResponse.va_numbers || [],
      bank: chargeResponse.bank || bank,
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.midtransWebhook = async (req, res) => {
  try {
    const notification = req.body;

    if (!verifySignature(notification)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const paymentStatus = normalizePaymentStatus(transactionStatus);

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const updates = {
      status: paymentStatus,
      transactionId: notification.transaction_id || payment.transactionId,
      transactionStatus,
      gatewayResponse: notification,
    };

    let subscription = null;

    if (paymentStatus === "PAID" && payment.status !== "PAID") {
      subscription = await upsertSubscription(payment.tenantId, payment.planId);
      updates.subscriptionId = subscription.id;
    }

    await prisma.subscriptionPayment.update({
      where: { orderId },
      data: updates,
    });

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function upsertSubscription(tenantId, planId) {
  const now = new Date();

  const activeSubscription = await prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: { endDate: "desc" },
  });

  const baseDate =
    activeSubscription && activeSubscription.endDate > now
      ? activeSubscription.endDate
      : now;

  const endDate = addMonths(baseDate, 1);

  if (activeSubscription) {
    return prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: {
        planId,
        status: "ACTIVE",
        startDate: now,
        endDate,
      },
    });
  }

  return prisma.subscription.create({
    data: {
      tenantId,
      planId,
      status: "ACTIVE",
      startDate: now,
      endDate,
    },
  });
}
