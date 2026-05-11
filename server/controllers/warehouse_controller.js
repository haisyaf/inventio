const prisma = require("../lib/prisma");

const createWarehouse = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  const { name, location, description } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Nama gudang tidak boleh kosong." });
  }

  if (!location) {
    return res
      .status(400)
      .json({ message: "Lokasi gudang tidak boleh kosong." });
  }

  try {
    const newWarehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
        description: description || "",
        tenantId,
      },
    });
    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error("Error saat membuat gudang:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getWarehouses = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(warehouses);
  } catch (error) {
    console.error("Error saat mengambil gudang:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getWarehouseById = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Gudang tidak ditemukan." });
    }

    res.status(200).json(warehouse);
  } catch (error) {
    console.error("Error saat mengambil gudang by ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { name, location, description } = req.body;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  if (!name) {
    return res
      .status(400)
      .json({ message: "Nama gudang tidak boleh kosong." });
  }

  if (!location) {
    return res
      .status(400)
      .json({ message: "Lokasi gudang tidak boleh kosong." });
  }

  try {
    const updatedWarehouse = await prisma.warehouse.updateMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
      data: {
        name,
        location,
        description: description || "",
      },
    });

    if (updatedWarehouse.count === 0) {
      return res.status(404).json({
        message: "Gudang tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    res.status(200).json(warehouse);
  } catch (error) {
    console.error("Error saat memperbarui gudang:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const deleteWarehouse = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const stockCount = await prisma.stock.count({
      where: {
        warehouseId: id,
        tenantId: tenantId,
      },
    });

    if (stockCount > 0) {
      return res.status(400).json({
        message: "Tidak dapat menghapus gudang karena masih memiliki stok.",
      });
    }

    const transactionCount = await prisma.transaction.count({
      where: {
        warehouseId: id,
        tenantId: tenantId,
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus gudang karena masih terhubung dengan transaksi.",
      });
    }

    const deletedWarehouse = await prisma.warehouse.deleteMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (deletedWarehouse.count === 0) {
      return res.status(404).json({
        message: "Gudang tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    res.status(200).json({ message: "Gudang berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus gudang:", error);
    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus gudang karena masih terhubung dengan data lain.",
      });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};
