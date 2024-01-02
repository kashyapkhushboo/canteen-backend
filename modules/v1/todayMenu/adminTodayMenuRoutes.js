const verifyToken = require("../../../middlewares/auth");
const { addTodayMenu, deleteTodayMenu } = require("./todayMenuController");

const adminTodayMenuRoutes = require("express").Router();

adminTodayMenuRoutes.post("/add-today-menu", addTodayMenu);
adminTodayMenuRoutes.delete("/delete-today-menu", deleteTodayMenu);

module.exports = adminTodayMenuRoutes;
