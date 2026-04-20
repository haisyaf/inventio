const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/auth_controller");

router.post("/login", tenantController.login);

module.exports = router;
