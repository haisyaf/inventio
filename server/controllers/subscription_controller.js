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

const snap = new midtransClient.Snap({
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
  // Midtrans max order_id = 50 chars; use last 8 chars of tenantId + timestamp
  return `SUBS-${tenantId.slice(-8)}-${Date.now()}`;
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

// Snap checkout — returns a redirect_url to Midtrans payment page
exports.checkoutSnap = async (req, res) => {
  try {
    const { tenantId } = req.userData;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }

    if (!serverKey) {
      return res
        .status(500)
        .json({ message: "Midtrans server key is not configured" });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (plan.price <= 0) {
      const subscription = await upsertSubscription(tenantId, plan.id);
      return res.status(200).json({ message: "Subscription activated", subscription });
    }

    const orderId = buildOrderId(tenantId);
    const grossAmount = Math.round(plan.price);

    const snapParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: plan.id,
          price: grossAmount,
          quantity: 1,
          name: `Subscription: ${plan.name}`,
        },
      ],
      credit_card: { secure: true },
    };

    const snapResponse = await snap.createTransaction(snapParams);

    const payment = await prisma.subscriptionPayment.create({
      data: {
        tenantId,
        planId: plan.id,
        orderId,
        grossAmount,
        paymentType: "snap",
        status: "PENDING",
        transactionId: null,
        transactionStatus: "pending",
        gatewayResponse: snapResponse,
      },
    });

    res.status(201).json({
      message: "Payment created",
      orderId: payment.orderId,
      snapToken: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CoreApi checkout — QRIS
exports.checkoutQris = async (req, res) => {
  try {
    const { tenantId } = req.userData;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }

    if (!serverKey) {
      return res.status(500).json({ message: "Midtrans server key is not configured" });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (plan.price <= 0) {
      const subscription = await upsertSubscription(tenantId, plan.id);
      return res.status(200).json({ message: "Subscription activated", subscription });
    }

    const orderId = buildOrderId(tenantId);
    const grossAmount = Math.round(plan.price);

    const chargeParams = {
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
    };

    const chargeResponse = await coreApi.charge(chargeParams);

    const qrUrl = chargeResponse.actions?.find((a) => a.name === "generate-qr-code")?.url || null;
    const qrString = chargeResponse.qr_string || null;

    const payment = await prisma.subscriptionPayment.create({
      data: {
        tenantId,
        planId: plan.id,
        orderId,
        grossAmount,
        paymentType: "qris",
        status: normalizePaymentStatus(chargeResponse.transaction_status),
        transactionId: chargeResponse.transaction_id || null,
        transactionStatus: chargeResponse.transaction_status || null,
        gatewayResponse: chargeResponse,
      },
    });

    res.status(201).json({
      message: "QRIS payment created",
      orderId: payment.orderId,
      qrUrl,
      qrString,
      expiryTime: chargeResponse.expiry_time || null,
      payment,
    });
  } catch (error) {
    console.error("QRIS checkout error:", error);
    const midtransMsg = error?.ApiResponse?.status_message || error?.message || null;
    res.status(500).json({ message: "Internal server error", detail: midtransMsg });
  }
};

// CoreApi checkout — bank transfer (VA)
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

// Manually check payment status from Midtrans and sync to DB
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tenantId } = req.userData;

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.tenantId !== tenantId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const statusResponse = await coreApi.transaction.status(orderId);
    const paymentStatus = normalizePaymentStatus(statusResponse.transaction_status);

    const updates = {
      status: paymentStatus,
      transactionId: statusResponse.transaction_id || payment.transactionId,
      transactionStatus: statusResponse.transaction_status,
      gatewayResponse: statusResponse,
    };

    if (paymentStatus === "PAID" && payment.status !== "PAID") {
      const subscription = await upsertSubscription(payment.tenantId, payment.planId);
      updates.subscriptionId = subscription.id;
    }

    const updated = await prisma.subscriptionPayment.update({
      where: { orderId },
      data: updates,
    });

    res.json({ payment: updated, midtransStatus: statusResponse.transaction_status });
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
