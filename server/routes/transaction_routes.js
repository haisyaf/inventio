const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
} = require("../controllers/transaction_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

router.get("/", getTransactions);
router.post("/", createTransaction);

module.exports = router;
