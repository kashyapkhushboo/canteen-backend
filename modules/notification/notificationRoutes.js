const { notificationList } = require("./notificationController");

const notificationRoutes = require("express").Router();

notificationRoutes.get("/notification-list", notificationList);

module.exports = notificationRoutes;
