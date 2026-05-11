const express = require("express");
const router = express.Router();
const forecastController = require("../controllers/forecast_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.post("/request", authMiddleware, forecastController.requestForecast);
router.get("/", authMiddleware, forecastController.getForecastResults);

module.exports = router;
