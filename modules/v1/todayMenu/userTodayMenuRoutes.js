const { listTodayMenu } = require("./todayMenuController");

const userTodayMenuRoutes = require("express").Router();

userTodayMenuRoutes.get("/list-todayMenu", listTodayMenu);

module.exports = userTodayMenuRoutes;
