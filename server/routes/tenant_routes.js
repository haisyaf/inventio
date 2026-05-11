const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenant_controller");

/**
 * @openapi
 * /api/tenants/register:
 *   post:
 *     tags: [Tenants]
 *     summary: Register tenant and admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantRegisterRequest'
 *     responses:
 *       201:
 *         description: Tenant registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantRegisterResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/register", tenantController.registerTenant);

module.exports = router;
