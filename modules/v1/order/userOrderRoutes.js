const { addOrder,usersOrder } = require("./orderController");

const userOrderRoutes = require("express").Router();

userOrderRoutes.post("/add-order", addOrder);
userOrderRoutes.get("/user-order",usersOrder)

module.exports = userOrderRoutes;
