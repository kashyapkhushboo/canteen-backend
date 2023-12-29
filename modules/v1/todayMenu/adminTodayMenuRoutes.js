const verifyToken = require("../../../middlewares/auth");
const { addTodayMenu, deleteTodayMenu } = require("./todayMenuController");

const adminTodayMenuRoutes = require("express").Router();

adminTodayMenuRoutes.post("/add-todayMenu", verifyToken, addTodayMenu);
adminTodayMenuRoutes.delete("/delete-todayMenu", verifyToken, deleteTodayMenu);

module.exports = adminTodayMenuRoutes;
