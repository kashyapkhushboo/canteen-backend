const { listTodayMenu } = require("./todayMenuController");

const userTodayMenuRoutes = require("express").Router();

userTodayMenuRoutes.get("/list-today-menu", listTodayMenu);

module.exports = userTodayMenuRoutes;
