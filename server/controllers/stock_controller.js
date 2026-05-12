const prisma = require("../lib/prisma");

exports.getStocks = async (req, res) => {
  const tenantId = req.userData?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const { warehouseId, productId } = req.query || {};
  const where = { tenantId };

  if (warehouseId) where.warehouseId = warehouseId;
  if (productId) where.productId = productId;

  try {
    const stocks = await prisma.stock.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json(stocks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getStockSummary = async (req, res) => {
  const tenantId = req.userData?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  try {
    const summary = await prisma.stock.groupBy({
      by: ["productId"],
      where: { tenantId },
      _sum: { quantity: true },
    });

    return res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
