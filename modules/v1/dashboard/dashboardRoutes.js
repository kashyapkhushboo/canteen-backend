const { count } = require("./dashboardController.js");

const dashboardRoutes = require("express").Router();

dashboardRoutes.get("/dashboard-list", count);

module.exports = dashboardRoutes;
