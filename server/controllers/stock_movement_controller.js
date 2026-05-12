const prisma = require("../lib/prisma");

exports.getStockMovements = async (req, res) => {
  const tenantId = req.userData?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const { warehouseId, productId, fromDate, toDate, type } = req.query || {};
  const where = { tenantId };

  if (warehouseId) where.warehouseId = warehouseId;
  if (productId) where.productId = productId;
  if (type) where.type = type.toUpperCase();

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  try {
    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        warehouse: true,
        transaction: true,
      },
    });

    return res.status(200).json(movements);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
