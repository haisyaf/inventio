const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/invite_controller");
const authMiddleware = require("../middlewares/auth_middleware");
const adminMiddleware = require("../middlewares/admin_middleware");
const { requireFeature } = require("../middlewares/feature_middleware");

/**
 * @openapi
 * /api/invites:
 *   post:
 *     tags: [Invites]
 *     summary: Create invite (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteCreateRequest'
 *     responses:
 *       201:
 *         description: Invite created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 invite:
 *                   $ref: '#/components/schemas/Invite'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  requireFeature("addUser"),
  inviteController.createInvite,
);

/**
 * @openapi
 * /api/invites/{token}:
 *   get:
 *     tags: [Invites]
 *     summary: Verify invite token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email: { type: string }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:token", inviteController.verifyInvite);

/**
 * @openapi
 * /api/invites/accept:
 *   post:
 *     tags: [Invites]
 *     summary: Accept invite and create member account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteAcceptRequest'
 *     responses:
 *       201:
 *         description: Invite accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 userId: { type: string }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/accept", inviteController.acceptInvite);

module.exports = router;
