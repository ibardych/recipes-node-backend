const express = require("express");

const {
  validateBody,
  authenticate,
  validateSubscription,
  validateEmail,
  uploadAvatar,
} = require("../../middlewares");
const { schemas } = require("../../models/user");
const ctrl = require("../../controllers/auth");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.get("/verify/:verificationToken", ctrl.verifyEmail);
router.post(
  "/verify",
  validateEmail(schemas.emailSchema),
  ctrl.resendVerifyEmail
);
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.get("/current", authenticate, ctrl.getCurrentUser);
router.post("/logout", authenticate, ctrl.logout);
router.patch(
  "/",
  authenticate,
  validateSubscription(schemas.updateSubscriptionSchema),
  ctrl.updateSubscription
);
router.patch(
  "/update",
  authenticate,
  uploadAvatar.single("file"), // upload.single("file"),
  ctrl.updateUserDataCloud
);

router.post("/refresh", validateBody(schemas.refreshSchema), ctrl.refresh);

module.exports = router;
