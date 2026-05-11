const express = require("express");
const router = express.Router();
const forecastController = require("../controllers/forecast_controller");
const authMiddleware = require("../middlewares/auth_middleware");

/**
 * @openapi
 * /api/forecasts/request:
 *   post:
 *     tags: [Forecasts]
 *     summary: Request forecast and store results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForecastRequest'
 *     responses:
 *       200:
 *         description: Forecast processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForecastResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       502:
 *         description: Upstream AI API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/request", authMiddleware, forecastController.requestForecast);

/**
 * @openapi
 * /api/forecasts:
 *   get:
 *     tags: [Forecasts]
 *     summary: Get forecast results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: forecastType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [stock_demand, sales_revenue, purchase_cost]
 *       - in: query
 *         name: fromDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Forecast list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForecastListResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", authMiddleware, forecastController.getForecastResults);

module.exports = router;
