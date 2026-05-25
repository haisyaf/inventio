const prisma = require("../lib/prisma");

const parseForecastDate = (dateStr) => {
  if (!dateStr) return null;
  // Weekly: YYYY-WWnnZ → Monday of that ISO week
  const weekMatch = dateStr.match(/^(\d{4})-W(\d{2})Z?$/);
  if (weekMatch) {
    const year = parseInt(weekMatch[1]);
    const week = parseInt(weekMatch[2]);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
    return monday;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const FORECAST_TYPE_MAP = {
  stock_demand: "STOCK_DEMAND",
  sales_revenue: "SALES_REVENUE",
  purchase_cost: "PURCHASE_COST",
};

const DEFAULT_UNIT_MAP = {
  STOCK_DEMAND: "units",
  SALES_REVENUE: "IDR",
  PURCHASE_COST: "IDR",
};

const normalizeForecastType = (forecastType) => {
  if (!forecastType || typeof forecastType !== "string") {
    return null;
  }

  return FORECAST_TYPE_MAP[forecastType.toLowerCase()] || null;
};

const buildTransactionFilter = (filters) => {
  if (!filters) {
    return {};
  }

  const transactionFilter = {};

  if (
    Array.isArray(filters.transactionTypeCodes) &&
    filters.transactionTypeCodes.length > 0
  ) {
    transactionFilter.type = {
      code: { in: filters.transactionTypeCodes },
    };
  }

  if (filters.direction) {
    transactionFilter.type = {
      ...(transactionFilter.type || {}),
      direction: filters.direction,
    };
  }

  if (filters.fromDate || filters.toDate) {
    transactionFilter.date = {};
    if (filters.fromDate) {
      transactionFilter.date.gte = new Date(filters.fromDate);
    }
    if (filters.toDate) {
      transactionFilter.date.lte = new Date(filters.toDate);
    }
  }

  return transactionFilter;
};

const FORECAST_DIRECTION_MAP = {
  STOCK_DEMAND: "OUT",
  SALES_REVENUE: "OUT",
  PURCHASE_COST: "IN",
};

const getHistoricalData = async ({
  forecastType,
  items,
  tenantId,
  globalFilters,
}) => {
  const normalizedType = normalizeForecastType(forecastType);
  if (!normalizedType) {
    throw new Error("Unsupported forecast type");
  }

  const results = [];

  for (const item of items) {
    const itemFilters = { ...(item.filters || globalFilters || {}) };
    if (!itemFilters.direction) {
      itemFilters.direction = FORECAST_DIRECTION_MAP[normalizedType];
    }
    const transactionFilter = buildTransactionFilter(itemFilters);

    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        productId: item.itemId,
        transaction: {
          tenantId,
          ...transactionFilter,
        },
      },
      select: {
        quantity: true,
        subtotal: true,
        transaction: {
          select: {
            date: true,
          },
        },
      },
      orderBy: {
        transaction: {
          date: "asc",
        },
      },
    });

    const dailyMap = {};
    for (const row of transactionItems) {
      const dateKey = row.transaction.date.toISOString().split("T")[0];
      if (!dailyMap[dateKey]) dailyMap[dateKey] = 0;
      dailyMap[dateKey] +=
        normalizedType === "STOCK_DEMAND" ? row.quantity : row.subtotal;
    }

    const historicalData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date: `${date}T00:00:00Z`, value }));

    results.push({
      itemId: item.itemId,
      historicalData,
    });
  }

  return results;
};

exports.requestForecast = async (req, res) => {
  const { forecastType, forecastParameters, items, filters } = req.body || {};
  const tenantId = req.userData?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  if (!forecastType || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "forecastType and items are required" });
  }

  const normalizedType = normalizeForecastType(forecastType);
  if (!normalizedType) {
    return res.status(400).json({ message: "Unsupported forecast type" });
  }

  const itemIds = items.map((item) => item.itemId).filter(Boolean);
  if (itemIds.length === 0) {
    return res.status(400).json({ message: "items must include itemId" });
  }

  const aiUrl =
    process.env.AI_API_URL ||
    (process.env.AI_API_BASE_URL
      ? `${process.env.AI_API_BASE_URL}/api/predict`
      : null);

  if (!aiUrl) {
    return res.status(500).json({ message: "AI API URL is not configured" });
  }

  try {
    const historicalData = await getHistoricalData({
      forecastType,
      items,
      tenantId,
      globalFilters: filters,
    });

    const aiRequestBody = {
      forecastType,
      forecastParameters: forecastParameters || {},
      items: historicalData,
    };

    const aiResponse = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiRequestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return res.status(502).json({
        message: "AI API request failed",
        detail: errorText,
      });
    }

    const aiResult = await aiResponse.json();
    const results = Array.isArray(aiResult.results) ? aiResult.results : [];

    const successResults = results.filter(
      (result) => result.status === "success",
    );
    const successItemIds = successResults.map((result) => result.itemId);

    if (successItemIds.length > 0) {
      await prisma.forecast.deleteMany({
        where: {
          tenantId,
          productId: { in: successItemIds },
          type: normalizedType,
        },
      });
    }

    const forecastRows = [];
    for (const result of successResults) {
      const forecastList = Array.isArray(result.forecast)
        ? result.forecast
        : [];
      for (const forecast of forecastList) {
        const forecastDate = parseForecastDate(forecast.forecastDate);
        if (!forecastDate) {
          console.error("Skipping invalid forecastDate:", forecast.forecastDate);
          continue;
        }
        forecastRows.push({
          tenantId,
          productId: result.itemId,
          type: normalizedType,
          forecastValue: forecast.forecastValue,
          unit: forecast.unit || DEFAULT_UNIT_MAP[normalizedType],
          forecastDate,
        });
      }
    }

    if (forecastRows.length > 0) {
      await prisma.forecast.createMany({ data: forecastRows });
    }

    return res.status(200).json({
      message: "Forecast processed",
      jobId: aiResult.jobId || null,
      results: aiResult.results || [],
      savedCount: forecastRows.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getForecastResults = async (req, res) => {
  const { productId, forecastType, fromDate, toDate } = req.query || {};
  const tenantId = req.userData?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  if (!productId || !forecastType) {
    return res
      .status(400)
      .json({ message: "productId and forecastType are required" });
  }

  const normalizedType = normalizeForecastType(forecastType);
  if (!normalizedType) {
    return res.status(400).json({ message: "Unsupported forecast type" });
  }

  const dateFilter = {};
  if (fromDate) {
    dateFilter.gte = new Date(fromDate);
  }
  if (toDate) {
    dateFilter.lte = new Date(toDate);
  }

  try {
    const forecasts = await prisma.forecast.findMany({
      where: {
        tenantId,
        productId,
        type: normalizedType,
        ...(Object.keys(dateFilter).length > 0
          ? { forecastDate: dateFilter }
          : {}),
      },
      orderBy: {
        forecastDate: "asc",
      },
    });

    return res.status(200).json({
      data: forecasts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
