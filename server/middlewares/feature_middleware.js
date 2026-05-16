const prisma = require("../lib/prisma");

async function getActivePlan(tenantId) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      tenantId,
      status: "ACTIVE",
      endDate: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { endDate: "desc" },
  });

  return subscription?.plan ?? null;
}

// Check boolean feature flag (e.g. "forecast", "addUser")
function requireFeature(featureKey) {
  return async (req, res, next) => {
    try {
      const { tenantId } = req.userData;
      const plan = await getActivePlan(tenantId);

      if (!plan) {
        return res.status(403).json({ message: "No active subscription" });
      }

      if (!plan.features[featureKey]) {
        return res.status(403).json({
          message: `Feature '${featureKey}' is not available on your current plan`,
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

// Check numeric limit (e.g. "maxWarehouses")
function requireLimit(featureKey, countFn) {
  return async (req, res, next) => {
    try {
      const { tenantId } = req.userData;
      const plan = await getActivePlan(tenantId);

      if (!plan) {
        return res.status(403).json({ message: "No active subscription" });
      }

      const limit = plan.features[featureKey];
      if (limit === undefined) return next();

      const current = await countFn(tenantId);
      if (current >= limit) {
        return res.status(403).json({
          message: `You have reached the maximum of ${limit} ${featureKey.replace("max", "").toLowerCase()} on your current plan`,
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = { requireFeature, requireLimit };
