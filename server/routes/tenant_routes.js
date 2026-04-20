const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenant_controller");

router.post("/register", tenantController.registerTenant);

module.exports = router;
