const express = require("express");
const router = express.Router();
const {
  getStockMovements,
} = require("../controllers/stock_movement_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

router.get("/", getStockMovements);

module.exports = router;
