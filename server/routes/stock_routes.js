const express = require("express");
const router = express.Router();
const {
  getStocks,
  getStockSummary,
} = require("../controllers/stock_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

router.get("/", getStocks);
router.get("/summary", getStockSummary);

module.exports = router;
