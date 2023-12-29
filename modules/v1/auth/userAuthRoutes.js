const { login, verifyOTP } = require("./authController");

const userAuthRoutes = require("express").Router();

userAuthRoutes.post("/login", login);
userAuthRoutes.post("/verify-otp", verifyOTP);

module.exports = userAuthRoutes;
