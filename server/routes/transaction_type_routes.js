const express = require("express");
const router = express.Router();
const { getTransactionTypes } = require("../controllers/transaction_type_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.use(authMiddleware);

/**
 * @openapi
 * /api/transaction-types:
 *   get:
 *     tags: [Transactions]
 *     summary: List transaction types for this tenant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction types list
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", getTransactionTypes);

module.exports = router;
