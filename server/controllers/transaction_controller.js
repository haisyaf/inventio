const prisma = require("../lib/prisma");

const normalizeDirection = (direction) =>
  typeof direction === "string" ? direction.toUpperCase() : null;

const validateItems = (items) =>
  Array.isArray(items) &&
  items.length > 0 &&
  items.every(
    (item) =>
      item &&
      typeof item.productId === "string" &&
      item.productId.trim() &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      typeof item.price === "number" &&
      item.price >= 0,
  );

const buildStockKey = (tenantId, warehouseId, productId) => ({
  tenantId,
  warehouseId,
  productId,
});

exports.createTransaction = async (req, res) => {
  const tenantId = req.userData?.tenantId;
  const createdBy = req.userData?.userId;

  if (!tenantId || !createdBy) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const { typeId, warehouseId, supplierId, description, date, items } =
    req.body || {};

  if (!typeId || !warehouseId || !validateItems(items)) {
    return res.status(400).json({
      message: "typeId, warehouseId, and valid items are required",
    });
  }

  try {
    const transactionType = await prisma.transactionType.findFirst({
      where: { id: typeId, tenantId },
    });

    if (!transactionType) {
      return res.status(404).json({ message: "Transaction type not found" });
    }

    const direction = normalizeDirection(transactionType.direction);
    if (!direction || (direction !== "IN" && direction !== "OUT")) {
      return res.status(400).json({ message: "Invalid transaction direction" });
    }

    const transactionDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          warehouseId,
          supplierId: supplierId || null,
          typeId,
          createdBy,
          description: description || "",
          date: transactionDate,
        },
      });

      const itemRows = items.map((item) => ({
        transactionId: transaction.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      await tx.transactionItem.createMany({ data: itemRows });

      const movements = [];

      for (const item of items) {
        const stockKey = buildStockKey(tenantId, warehouseId, item.productId);
        const existingStock = await tx.stock.findFirst({
          where: stockKey,
        });

        const beforeQty = existingStock ? existingStock.quantity : 0;
        const delta = direction === "IN" ? item.quantity : -item.quantity;
        const afterQty = beforeQty + delta;

        if (afterQty < 0) {
          throw new Error("Insufficient stock");
        }

        if (existingStock) {
          await tx.stock.update({
            where: { id: existingStock.id },
            data: { quantity: afterQty },
          });
        } else {
          await tx.stock.create({
            data: {
              ...stockKey,
              quantity: afterQty,
            },
          });
        }

        movements.push({
          tenantId,
          transactionId: transaction.id,
          warehouseId,
          productId: item.productId,
          quantity: item.quantity,
          type: direction,
          beforeQuantity: beforeQty,
          afterQuantity: afterQty,
        });
      }

      if (transactionType.affectsStock && movements.length > 0) {
        await tx.stockMovement.createMany({ data: movements });
      }

      return transaction;
    });

    return res.status(201).json({
      message: "Transaction created",
      transactionId: result.id,
    });
  } catch (error) {
    if (error.message === "Insufficient stock") {
      return res.status(400).json({ message: "Stock cannot go below zero" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTransactions = async (req, res) => {
  const tenantId = req.userData?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const { warehouseId, typeId, fromDate, toDate } = req.query || {};
  const where = { tenantId };

  if (warehouseId) where.warehouseId = warehouseId;
  if (typeId) where.typeId = typeId;

  if (fromDate || toDate) {
    where.date = {};
    if (fromDate) where.date.gte = new Date(fromDate);
    if (toDate) where.date.lte = new Date(toDate);
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        items: true,
        type: true,
        warehouse: true,
        supplier: true,
      },
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
