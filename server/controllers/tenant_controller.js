const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new tenant
exports.registerTenant = async (req, res) => {
  const { tenantName, tenantSlug, userEmail, userName, password, planId } = req.body;

  try {
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
        email: userEmail,
        phone: "",
        address: "",
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        password: hashedPassword,
        tenantId: tenant.id,
        role: "ADMIN",
      },
    });

    let chosenPlan = null;
    if (planId) {
      chosenPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    }
    if (!chosenPlan) {
      chosenPlan = await prisma.subscriptionPlan.findFirst({ where: { name: "Basic" } });
    }

    if (chosenPlan) {
      const isPaid = chosenPlan.price > 0;
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: chosenPlan.id,
          status: isPaid ? "UNPAID" : "ACTIVE",
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + (isPaid ? 1 : 2))),
        },
      });
    }

    const defaultTransactionTypes = [
      { name: "Pembelian", code: `PURCHASE_${tenant.id.slice(0, 8)}`, direction: "IN", affectsStock: true },
      { name: "Penjualan", code: `SALE_${tenant.id.slice(0, 8)}`, direction: "OUT", affectsStock: true },
      { name: "Penyesuaian Masuk", code: `ADJ_IN_${tenant.id.slice(0, 8)}`, direction: "IN", affectsStock: true },
      { name: "Penyesuaian Keluar", code: `ADJ_OUT_${tenant.id.slice(0, 8)}`, direction: "OUT", affectsStock: true },
    ];

    await prisma.transactionType.createMany({
      data: defaultTransactionTypes.map((t) => ({ ...t, tenantId: tenant.id })),
    });

    const token = jwt.sign(
      { userId: user.id, tenantId: tenant.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "Tenant and admin user created successfully",
      token,
      userId: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
