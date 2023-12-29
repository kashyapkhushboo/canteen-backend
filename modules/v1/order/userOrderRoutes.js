const { addOrder } = require("./orderController");

const userOrderRoutes = require("express").Router();

userOrderRoutes.post("/add-order", addOrder);

module.exports = userOrderRoutes;
