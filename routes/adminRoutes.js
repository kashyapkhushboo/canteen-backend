const express = require("express");

const {listUsers, createUser, deleteUser, updateUser}= require("../modules/user/userController")

const {
  deleteMenu,
  updateMenu,
  addMenu,
  listMenu,
} = require("../modules/admin/menu/menuController");
const {
  addSubMenu,
  updateSubMenu,
  deleteSubMenu,
  listSubMenu,
} = require("../modules/admin/menu/subMenuController");
const {
  listOrder,
  updateBalance,
  updateStatus,
  pendingOrderList,
  notificationList,
} = require("../modules/admin/order/orderController");
let auth = require("../middlewares/auth");
const {
  addTodayMenu,
  updateTodayMenu,
  deleteTodayMenu,
} = require("../modules/admin/todayMenu/todayMenuController");
const { Count, balance } = require("../modules/dashboard/data");

const router = express.Router();

router.route("/notification").get(auth,notificationList);


router.route("/count").get(auth,Count);
router.route("/bal").get(auth,balance);



router.route("/createUser").post(auth, createUser);
router.route("/deleteUser").delete(auth, deleteUser);
router.route("/update-user").put(auth, updateUser);


router.route("/addMenu").post(auth, addMenu);
router.route("/updateMenu").put(auth, updateMenu);

router.route("/deleteMenu").delete(auth, deleteMenu);

router.route("/addSubMenu").post(auth, addSubMenu);
router.route("/updateSubMenu").put(auth, updateSubMenu);
router.route("/listSubMenu").get(auth,listSubMenu);
router.route("/deleteSubMenu").delete(auth, deleteSubMenu);
router.route("/listMenu").get(listMenu);


router.route("/addTodayMenu").post(auth, addTodayMenu);
router.route("/updateTodayMenu").put(auth, updateTodayMenu);

router.route("/deleteTodayMenu").delete(auth, deleteTodayMenu);

// router.route("/addOrder").post(auth, addOrder);
router.route("/pendingOrderList").get(auth,pendingOrderList);
router.route("/order/updateStatus").post(auth, updateStatus);
router.route("/updateBalance").post(auth, updateBalance);
router.route("/listorder").get(auth, listOrder);

router.route("/listUsers").get(listUsers);

module.exports = router;
