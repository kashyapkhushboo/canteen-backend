const express = require("express");
const userTodayMenuRoutes = require("../modules/v1/todayMenu/userTodayMenuRoutes");
const userAuthRoutes = require("../modules/v1/auth/userAuthRoutes");
const userOrderRoutes = require("../modules/v1/order/userOrderRoutes");
const notificationRoutes = require("../modules/notification/notificationRoutes");
const verifyToken = require("../middlewares/auth");

const app = express();
app.use("/auth", userAuthRoutes);
app.use("/todayMenu", userTodayMenuRoutes);
app.use("/todayMenu", userOrderRoutes);
app.use("/notification", verifyToken, notificationRoutes);

module.exports = app;
