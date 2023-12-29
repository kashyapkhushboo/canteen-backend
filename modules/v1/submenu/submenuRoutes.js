const {
  listSubMenu,
  addSubMenu,
  updateSubMenu,
  deleteSubMenu,
} = require("./subMenuController");

const subMenuRoutes = require("express").Router();

subMenuRoutes.get("/list-submenu", listSubMenu);
subMenuRoutes.post("/add-submenu", addSubMenu);
subMenuRoutes.put("/update-submenu", updateSubMenu);
subMenuRoutes.delete("/delete-submenu", deleteSubMenu);

module.exports = subMenuRoutes;
