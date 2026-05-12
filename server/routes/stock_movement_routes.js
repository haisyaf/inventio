const express = require("express");
const router = express.Router();
const {
  getStockMovements,
} = require("../controllers/stock_movement_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

/**
 * @openapi
 * /api/stock-movements:
 *   get:
 *     tags: [Stock Movements]
 *     summary: List stock movements
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Stock movements list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockMovement'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", getStockMovements);

module.exports = router;
