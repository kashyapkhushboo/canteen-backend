const {
  listOrder,
  updateStatus,
  pendingOrderList,
} = require("./orderController");

const adminOrderRoutes = require("express").Router();

adminOrderRoutes.get("/pending-order", pendingOrderList);
adminOrderRoutes.get("/list-order", listOrder);
adminOrderRoutes.post("/update-status", updateStatus);

module.exports = adminOrderRoutes;
