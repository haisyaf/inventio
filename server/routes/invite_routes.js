const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/invite_controller");
const authMiddleware = require("../middlewares/auth_middleware");
const adminMiddleware = require("../middlewares/admin_middleware");

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  inviteController.createInvite,
);
router.get("/:token", inviteController.verifyInvite);
router.post("/accept", inviteController.acceptInvite);

module.exports = router;
