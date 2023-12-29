const {
  listMenu,
  addMenu,
  updateMenu,
  deleteMenu,
} = require("./menuController");

const menuRoutes = require("express").Router();

menuRoutes.get("/list-menu", listMenu);
menuRoutes.post("/add-menu", addMenu);
menuRoutes.put("/update-menu", updateMenu);
menuRoutes.delete("/delete-menu", deleteMenu);

module.exports = menuRoutes;
