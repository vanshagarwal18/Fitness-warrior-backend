const express = require("express");
const authController = require("../controllers/authController");
const badgeController = require("./../controllers/badgeController");
const router = express.Router();

router.post("/", authController.protect, badgeController.getbadge);
router.post(
  "/yes",
  authController.protect,
  badgeController.hasAlreadyMadeEntry,
  badgeController.madeYes
);
router.post(
  "/no",
  authController.protect,
  badgeController.hasAlreadyMadeEntry,
  badgeController.madeNo
);
router.post(
  "/nodefault",
  authController.protect,
  badgeController.madeNoByDefault
);

module.exports = router;
