const prisma = require("../lib/prisma");

const createCategory = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  const { name, description } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Nama kategori tidak boleh kosong." });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        description: description || "",
        tenantId,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error saat membuat kategori:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getCategories = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error saat mengambil kategori:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const category = await prisma.category.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan." });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error saat mengambil kategori by ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  if (!name) {
    return res
      .status(400)
      .json({ message: "Nama kategori tidak boleh kosong." });
  }

  try {
    const updatedCategory = await prisma.category.updateMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
      data: {
        name,
        description: description || "",
      },
    });

    if (updatedCategory.count === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    res.status(200).json(category);
  } catch (error) {
    console.error("Error saat memperbarui kategori:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const productsInCategory = await prisma.product.count({
      where: {
        categoryId: id,
        tenantId: tenantId,
      },
    });

    if (productsInCategory > 0) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus kategori karena masih digunakan oleh produk.",
      });
    }

    const deletedCategory = await prisma.category.deleteMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (deletedCategory.count === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    res.status(200).json({ message: "Kategori berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus kategori:", error);
    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus kategori karena masih terhubung dengan data lain.",
      });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
