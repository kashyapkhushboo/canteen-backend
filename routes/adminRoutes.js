const express = require("express");
const verifyToken = require("../middlewares/auth");
const menuRoutes = require("../modules/v1/menu/menuRoutes");
const subMenuRoutes = require("../modules/v1/submenu/submenuRoutes");
const walletRoutes = require("../modules/v1/wallet/walletRoutes");
const dashboardRoutes = require("../modules/dashboard/dashboardRoutes");
const adminAuthRoutes = require("../modules/v1/auth/adminAuthRoutes");
const adminOrderRoutes = require("../modules/v1/order/adminOrderRoutes");
const adminTodayMenuRoutes = require("../modules/v1/todayMenu/adminTodayMenuRoutes");

const app = express();

app.use("/auth", adminAuthRoutes);
app.use("/menu", verifyToken, menuRoutes);
app.use("/submenu", verifyToken, subMenuRoutes);
app.use("/order", verifyToken, adminOrderRoutes);
app.use("/todayMenu", adminTodayMenuRoutes);
app.use("/wallet", verifyToken, walletRoutes);
app.use("/dashboard", verifyToken, dashboardRoutes);

module.exports = app;
