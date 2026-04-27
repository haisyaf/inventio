const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/invite_controller");
const authMiddleware = require("../middleware/auth_middleware");
const adminMiddleware = require("../middleware/admin_middleware");

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  inviteController.createInvite,
);
router.get("/:token", inviteController.verifyInvite);
router.post("/accept", inviteController.acceptInvite);

module.exports = router;
