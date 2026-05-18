const prisma = require("../lib/prisma");

exports.getTransactionTypes = async (req, res) => {
  const tenantId = req.userData?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    const types = await prisma.transactionType.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
    return res.status(200).json(types);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
