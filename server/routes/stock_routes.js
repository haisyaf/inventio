const express = require("express");
const router = express.Router();
const {
  getStocks,
  getStockSummary,
} = require("../controllers/stock_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

/**
 * @openapi
 * /api/stocks:
 *   get:
 *     tags: [Stocks]
 *     summary: List stocks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stocks list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stock'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", getStocks);

/**
 * @openapi
 * /api/stocks/summary:
 *   get:
 *     tags: [Stocks]
 *     summary: Stock summary by product
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock summary list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockSummaryEntry'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/summary", getStockSummary);

module.exports = router;
