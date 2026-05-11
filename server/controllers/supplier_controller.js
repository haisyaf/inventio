const prisma = require("../lib/prisma");

const createSupplier = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  const { name, email, phone, address } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Nama supplier tidak boleh kosong." });
  }

  try {
    const newSupplier = await prisma.supplier.create({
      data: {
        name,
        email: email || "",
        phone: phone || "",
        address: address || "",
        tenantId,
      },
    });
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("Error saat membuat supplier:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getSuppliers = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error saat mengambil supplier:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getSupplierById = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier tidak ditemukan." });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error saat mengambil supplier by ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  if (!name) {
    return res
      .status(400)
      .json({ message: "Nama supplier tidak boleh kosong." });
  }

  try {
    const updatedSupplier = await prisma.supplier.updateMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
      data: {
        name,
        email: email || "",
        phone: phone || "",
        address: address || "",
      },
    });

    if (updatedSupplier.count === 0) {
      return res.status(404).json({
        message: "Supplier tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error saat memperbarui supplier:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const transactionCount = await prisma.transaction.count({
      where: {
        supplierId: id,
        tenantId: tenantId,
      },
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus supplier karena masih terhubung dengan transaksi.",
      });
    }

    const deletedSupplier = await prisma.supplier.deleteMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (deletedSupplier.count === 0) {
      return res.status(404).json({
        message: "Supplier tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    res.status(200).json({ message: "Supplier berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus supplier:", error);
    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus supplier karena masih terhubung dengan data lain.",
      });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
