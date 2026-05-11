const express = require("express");
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplier_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

router.get("/", getSuppliers);
router.post("/", createSupplier);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
