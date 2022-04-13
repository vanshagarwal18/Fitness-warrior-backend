const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/test", authController.protect, (req, res) => {
  res.json({
    status: "You are authorized",
  });
});
router.post("/forgetPassword", authController.forgetPassword);
router.patch("/resetPassword", authController.resetPassword);

module.exports = router;
