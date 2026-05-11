const prisma = require("../lib/prisma");

const createProduct = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  const { name, description, price, categoryId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nama produk tidak boleh kosong." });
  }

  if (!categoryId) {
    return res
      .status(400)
      .json({ message: "Kategori produk tidak boleh kosong." });
  }

  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: "Harga produk tidak valid." });
  }

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, tenantId: tenantId },
    });

    if (!category) {
      return res.status(400).json({ message: "Kategori tidak ditemukan." });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: Number(price),
        categoryId,
        tenantId,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error saat membuat produk:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getProducts = async (req, res) => {
  const tenantId = req.userData.tenantId;
  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error saat mengambil produk:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error saat mengambil produk by ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, categoryId } = req.body;
  const tenantId = req.userData.tenantId;

  if (!tenantId) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tenant tidak teridentifikasi." });
  }

  if (!name) {
    return res.status(400).json({ message: "Nama produk tidak boleh kosong." });
  }

  if (!categoryId) {
    return res
      .status(400)
      .json({ message: "Kategori produk tidak boleh kosong." });
  }

  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: "Harga produk tidak valid." });
  }

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, tenantId: tenantId },
    });

    if (!category) {
      return res.status(400).json({ message: "Kategori tidak ditemukan." });
    }

    const updatedProduct = await prisma.product.updateMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
      data: {
        name,
        description: description || "",
        price: Number(price),
        categoryId,
      },
    });

    if (updatedProduct.count === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error saat memperbarui produk:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const deleteProduct = async (req, res) => {
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
        productId: id,
        tenantId: tenantId,
      },
    });

    if (stockCount > 0) {
      return res.status(400).json({
        message: "Tidak dapat menghapus produk karena masih memiliki stok.",
      });
    }

    const transactionItemCount = await prisma.transactionItem.count({
      where: {
        productId: id,
      },
    });

    if (transactionItemCount > 0) {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus produk karena masih terhubung dengan transaksi.",
      });
    }

    const deletedProduct = await prisma.product.deleteMany({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (deletedProduct.count === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan atau Anda tidak punya akses.",
      });
    }

    res.status(200).json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus produk:", error);
    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(400).json({
        message:
          "Tidak dapat menghapus produk karena masih terhubung dengan data lain.",
      });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
