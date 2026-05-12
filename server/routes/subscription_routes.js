const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth_middleware");
const subscriptionController = require("../controllers/subscription_controller");

/**
 * @openapi
 * /api/plans:
 *   get:
 *     tags: [Subscriptions]
 *     summary: List subscription plans
 *     responses:
 *       200:
 *         description: Plans list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPlan'
 */
router.get("/plans", subscriptionController.listPlans);

/**
 * @openapi
 * /api/subscriptions/me:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get current tenant subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/subscriptions/me", auth, subscriptionController.getMySubscription);

/**
 * @openapi
 * /api/subscriptions/checkout:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Create a subscription payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionCheckoutRequest'
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionCheckoutResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  "/subscriptions/checkout",
  auth,
  subscriptionController.checkoutSubscription,
);

/**
 * @openapi
 * /api/subscriptions/webhook:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Midtrans payment notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/subscriptions/webhook", subscriptionController.midtransWebhook);

module.exports = router;
