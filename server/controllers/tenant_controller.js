const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Register a new tenant
exports.registerTenant = async (req, res) => {
  const { tenantName, tenantSlug, userEmail, userName, password } = req.body;

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
