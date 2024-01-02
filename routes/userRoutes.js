const express = require("express");
const userTodayMenuRoutes = require("../modules/v1/todayMenu/userTodayMenuRoutes");
const userAuthRoutes = require("../modules/v1/auth/userAuthRoutes");
const userOrderRoutes = require("../modules/v1/order/userOrderRoutes");
const notificationRoutes = require("../modules/v1/notification/notificationRoutes");
const verifyToken = require("../middlewares/auth");

const app = express();
app.use("/auth", userAuthRoutes);
app.use("/today-menu", userTodayMenuRoutes);
app.use("/order",verifyToken, userOrderRoutes);
app.use("/notification", verifyToken, notificationRoutes);

module.exports = app;
