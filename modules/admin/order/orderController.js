const { confirmOrder } = require("../../../helper/confirmOrderNotification");
const { rejectOrder } = require("../../../helper/rejectOrder");
const validator = require("../../../middlewares/validations");
const { EmpModel } = require("../../../models/empDetailsModel");
const { orderModel } = require("../../../models/ordersModel");
const { subMenuModel } = require("../../../models/subMenuModel");
const { Notification } = require("../../../models/notificationModel");
const moment = require("moment");
const { menuModel } = require("../../../models/menuModel");
const Excel = require("exceljs");
const { walletModel } = require("../../../models/walletHistory");
const { log } = require("console");

//custom order

const addOrder = async (req, res) => {
  try {
    let orderDetails = req.body;

    console.log("add-order", orderDetails);
    let orderData = {
      emp_id: req.emp.emp_id,
      order_rec: orderDetails.order_rec,
    };

    const requiredFeilds = {
      order_rec: orderDetails.order_rec,
    };
    let error = validator.isRequired(requiredFeilds);
    if (error.length != 0) {
      return res.status(400).json({
        statusCode: 400,
        error: error,
      });
    } else {

      let totalBalance = 0;

      for (let i = 0; i < orderData.order_rec.length; i++) {
        console.log(orderData.order_rec[i],"looooop");
        console.log(orderData.order_rec[i].itemId,"oooooooooooo");

        if (orderData.order_rec[i].itemId) {
          // If itemId is present, validate using itemId
        isSubMenuValid = await subMenuModel.findOne({
            _id: orderData.order_rec[i].itemId,
          });
          console.log(isSubMenuValid,"iddddddddddddddd");
        
        } else {
          // If itemId is not present, validate using menuId and item_name
          isSubMenuValid = await subMenuModel.findOne({
            menu_id: orderData.order_rec[i].menu_id,
            item_name:orderData.order_rec[i].item_name,
          });
console.log(isSubMenuValid,"menuuuuuuuuuuuuuuuuuuu");
        }

        if (!isSubMenuValid) {
          return res
            .status(400)
            .json({ error: `Item '${orderData.order_rec[i].item_name}' you have added in the order is invalid.` });
        }

        
        let perItemBalance =
        isSubMenuValid.price * orderDetails.order_rec[i].quantity;
      orderData.order_rec[i]["price"] = isSubMenuValid.price;
      orderData.order_rec[i]["totalPrice"] = perItemBalance;
      orderData.order_rec[i]["item_name"] = isSubMenuValid.item_name;
      console.log(perItemBalance,"perrrrrrrrrr");
      totalBalance = totalBalance + perItemBalance;
      console.log(totalBalance,"totalllllllllllllllll");
    }
    orderData.totalBalance = totalBalance;
      

      let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });

      if (empDetails.role === "admin") {
        if (!req.body.emp_id) {
          return res.status(400).json({
            statusCode: 400,
            error: "Employee id is required",
          });
        }

        let userDetails = await EmpModel.findOne({
          EmployeeId: req.body.emp_id,
        });

        if (!userDetails) {
          return res.status(404).json({ error: "Invalid employee id." });
        }

        let fullName = `${userDetails.FirstName}`;
        if (userDetails.LastName) fullName += ` ${userDetails.LastName}`;
        orderData.fullName = fullName;
        orderData.emp_id = req.body.emp_id;
        orderData.order_status = "confirm";
        orderData.bill_status = "unpaid";

        const newOrder = new orderModel(orderData);
        let result = await newOrder.save();
        if (orderData.bill_status === "unpaid") {
          let updateBalance, updatedWallet;
          let amt =
            userDetails.balance + (orderData.totalBalance - userDetails.wallet);
          if (amt < 0) {
            updatedWallet = -amt;
            updateBalance = 0;
          } else {
            updatedWallet = 0;
            updateBalance = amt;
          }
          await EmpModel.findByIdAndUpdate(userDetails._id, {
            balance: updateBalance,
            wallet: updatedWallet,
          });
        }

        const io = req.io;
        console.log("Global socketIds:", global.socketIds);

        const targetSockets = global.socketIds.filter(
          (entry) => entry.userId == userDetails.EmployeeId
        );

        console.log("EmployeeId:", userDetails.EmployeeId);
        console.log("Target Sockets:", targetSockets);

        const message = ` An order has been placed for ${userDetails.FirstName} by the admin.`;

        if (targetSockets.length > 0) {
          targetSockets.forEach((targetSocket) => {
            io.to(targetSocket.socketId).emit("notification", message);
            console.log(
              `Notification sent to user with ID: ${userDetails.EmployeeId}`
            );

            // Save the notification to the database
            const result = new Notification({
              userId: targetSocket.userId,
              message,
            });

            result
              .save()
              .then((savedNotification) => {
                console.log(
                  "Notification saved to the database:",
                  savedNotification
                );
              })
              .catch((error) => {
                console.error(
                  "Error saving notification to the database:",
                  error
                );
              });
          });
        } else {
          console.log(`User with ID ${empDetails.EmployeeId} not found.`);
        }

        await confirmOrder(userDetails.email, result);
        return res.status(200).json({
          statusCode: 200,
          message: "Order placed successfully.",
          data: result,
        });
      } else {
        let fullName = `${empDetails.FirstName}`;
        if (empDetails.LastName) fullName += ` ${empDetails.LastName}`;
        orderData.fullName = fullName;
        orderData.emp_id = req.emp.emp_id;
        orderData.order_status = "pending";
        orderData.bill_status = "unpaid";

        const newOrder = new orderModel(orderData);
        const io = req.io;

        console.log("Global socketIds:", global.socketIds);

        const adminEmployeeIds = await EmpModel.find({
          role: "admin",
        }).distinct("EmployeeId");
        console.log(adminEmployeeIds, "adminnnnnnnnnnnnnnnnnnn");

        const targetSockets = global.socketIds.filter((entry) =>
          adminEmployeeIds.includes(Number(entry.userId))
        );

        console.log("EmployeeId:", adminEmployeeIds);
        console.log("Target Sockets:", targetSockets);

        if (targetSockets.length > 0) {
          const message = `A new order has been placed by the ${empDetails.FirstName}. Please review the order. `;

          targetSockets.forEach((targetSocket) => {
            io.to(targetSocket.socketId).emit("notification", message);
            console.log(
              `Notification sent to user with ID: ${targetSocket.userId}`
            );

            // Save the notification to the database
            const result = new Notification({
              userId: targetSocket.userId,
              message,
            });

            result
              .save()
              .then((savedNotification) => {
                console.log(
                  "Notification saved to the database:",
                  savedNotification
                );
              })
              .catch((error) => {
                console.error(
                  "Error saving notification to the database:",
                  error
                );
              });
          });
        } else {
          console.log(`No matching admin users found in targetSockets.`);
        }
        let result = await newOrder.save();
        return res.status(200).json({
          statusCode: 200,
          message: "Order placed successfully.",
          data: result,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: err.message,
    });
  }
};


//without custom order

// const addOrder = async (req, res) => {
//   try {
//     let orderDetails = req.body;
//     console.log(
//       "1111111111111111111111",
//       orderDetails,
//       "1111111111111111111111"
//     );
//     console.log("add-order", orderDetails);
//     let orderData = {
//       emp_id: req.emp.emp_id,
//       order_rec: orderDetails.order_rec,
//     };
//     console.log(req.emp.emp_id, "}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
//     console.log("aaaaaaaaaaaaaaaaaa", orderData, "aaaaaaaaaaaaaaaaaaaaa");
//     const requiredFeilds = {
//       order_rec: orderDetails.order_rec,
//     };
//     let error = validator.isRequired(requiredFeilds);
//     if (error.length != 0) {
//       return res.status(400).json({
//         statusCode: 400,
//         error: error,
//       });
//     } else {
//       let subMenuDetails = await subMenuModel.findOne({
//         _id: orderDetails.order_rec[0].itemId,
//       });
//       console.log(subMenuDetails, "subbbbbbbbbbbbbb");
//       orderData.menu_id = subMenuDetails.menu_id;
//       orderDetails.menu_id = subMenuDetails.menu_id;
//       let isMenuExists = await menuModel.findOne({ _id: orderDetails.menu_id });
//       if (!isMenuExists) {
//         return res.status(404).json({ error: "Invalid menu id." });
//       }
//       let totalBalance = 0;
//       for (let i = 0; i < orderDetails.order_rec.length; i++) {
//         const isSubMenuIdValid = await subMenuModel.findOne({
//           _id: orderDetails.order_rec[i].itemId,
//           menu_id: orderData.menu_id,
//         });
//         if (!isSubMenuIdValid) {
//           return res
//             .status(400)
//             .json({ error: `Item you have added in order is invalid.` });
//         }
//         await subMenuModel.findByIdAndUpdate(isSubMenuIdValid._id, {
//           count: orderDetails.order_rec[i]["quantity"] + isSubMenuIdValid.count,
//         });

//         let perItemBalance =
//           isSubMenuIdValid.price * orderDetails.order_rec[i].quantity;
//         orderData.order_rec[i]["price"] = isSubMenuIdValid.price;
//         orderData.order_rec[i]["totalPrice"] = perItemBalance;
//         orderData.order_rec[i]["item_name"] = isSubMenuIdValid.item_name;
//         totalBalance = totalBalance + perItemBalance;
//       }
//       orderData.totalBalance = totalBalance;
//       let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });
//       console.log(empDetails, "khushiiiiiiiiiiiiiiiiiiiiiiiii");
//       if (empDetails.role === "admin") {
//         if (!req.body.emp_id) {
//           return res.status(400).json({
//             statusCode: 400,
//             error: "Employee id is required",
//           });
//         }
//         if (!req.body.bill_status) {
//           return res.status(400).json({
//             statusCode: 400,
//             error: "Bill status is required ",
//           });
//         }
//         if (
//           req.body.bill_status != "paid" &&
//           req.body.bill_status != "unpaid"
//         ) {
//           return res.status(400).json({
//             statusCode: 400,
//             error: "Invalid bill status.",
//           });
//         }
//         let userDetails = await EmpModel.findOne({
//           EmployeeId: req.body.emp_id,
//         });

//         if (!userDetails) {
//           return res.status(404).json({ error: "Invalid employee id." });
//         }
//         //pending or confirm order_status
//         //paid or unpaid  bill_status
//         let fullName = `${userDetails.FirstName}`;
//                 if(userDetails.LastName) fullName += ` ${userDetails.LastName}`
//                 orderData.fullName = fullName;
//         orderData.emp_id = req.body.emp_id;
//         orderData.order_status = "confirm";
//         orderData.bill_status = req.body.bill_status;

//         const newOrder = new orderModel(orderData);
//         let result = await newOrder.save();
//         if (orderData.bill_status === "unpaid") {
//           let updateBalance, updatedWallet;
//           let amt =
//             userDetails.balance + (orderData.totalBalance - userDetails.wallet);
//           if (amt < 0) {
//             updatedWallet = -amt;
//             updateBalance = 0;
//           } else {
//             updatedWallet = 0;
//             updateBalance = amt;
//           }
//           await EmpModel.findByIdAndUpdate(userDetails._id, {
//             balance: updateBalance,
//             wallet: updatedWallet,
//           });
//         }

//         const io = req.io;
//         console.log("Global socketIds:", global.socketIds);

//         const targetSockets = global.socketIds.filter(
//           (entry) => entry.userId == userDetails.EmployeeId
//         );

//         console.log("EmployeeId:", userDetails.EmployeeId);
//         console.log("Target Sockets:", targetSockets);

//         const message = ` An order has been placed for ${userDetails.FirstName} by the admin.`;

//         if (targetSockets.length > 0) {
//           targetSockets.forEach((targetSocket) => {
//             io.to(targetSocket.socketId).emit("notification", message);
//             console.log(
//               `Notification sent to user with ID: ${userDetails.EmployeeId}`
//             );

//             // Save the notification to the database
//             const result = new Notification({
//               userId: targetSocket.userId,
//               message,
//             });

//             result
//               .save()
//               .then((savedNotification) => {
//                 console.log(
//                   "Notification saved to the database:",
//                   savedNotification
//                 );
//               })
//               .catch((error) => {
//                 console.error(
//                   "Error saving notification to the database:",
//                   error
//                 );
//               });
//           });
//         } else {
//           console.log(`User with ID ${empDetails.EmployeeId} not found.`);
//         }

//         await confirmOrder(userDetails.email, result);
//         return res.status(200).json({
//           statusCode: 200,
//           message: "Order placed successfully.",
//           data: result,
//         });
//       } else {
//         let fullName = `${userDetails.FirstName}`;
//                 if(userDetails.LastName) fullName += ` ${userDetails.LastName}`
//                 orderData.fullName = fullName;
//         orderData.emp_id = req.emp.emp_id;
//         orderData.order_status = "pending";
//         orderData.bill_status = "unpaid";
//         const newOrder = new orderModel(orderData);
//         const io = req.io;

//         console.log("Global socketIds:", global.socketIds);

//         const adminEmployeeIds = await EmpModel.find({
//           role: "admin",
//         }).distinct("EmployeeId");
//         console.log(adminEmployeeIds, "adminnnnnnnnnnnnnnnnnnn");

//         const targetSockets = global.socketIds.filter((entry) =>
//           adminEmployeeIds.includes(Number(entry.userId))
//         );

//         console.log("EmployeeId:", adminEmployeeIds);
//         console.log("Target Sockets:", targetSockets);

//         if (targetSockets.length > 0) {
//           const message = `This is to inform you that a new order has been placed by the user ${empDetails.FirstName}. Please review the order `;

//           targetSockets.forEach((targetSocket) => {
//             io.to(targetSocket.socketId).emit("notification", message);
//             console.log(
//               `Notification sent to user with ID: ${targetSocket.userId}`
//             );

//             // Save the notification to the database
//             const result = new Notification({
//               userId: targetSocket.userId,
//               message,
//             });

//             result
//               .save()
//               .then((savedNotification) => {
//                 console.log(
//                   "Notification saved to the database:",
//                   savedNotification
//                 );
//               })
//               .catch((error) => {
//                 console.error(
//                   "Error saving notification to the database:",
//                   error
//                 );
//               });
//           });
//         } else {
//           console.log(`No matching admin users found in targetSockets.`);
//         }
//         let result = await newOrder.save();
//         return res.status(200).json({
//           statusCode: 200,
//           message: "Order placed successfully.",
//           data: result,
//         });
//       }
//     }
//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       error: err.message,
//     });
//   }
// };

const updateBalance = async (req, res) => {
  try {
    const { emp_id, payment } = req.body;
    console.log(req.body, "oooooooooooooooooooooooooo");
    let empDetails = await EmpModel.findOne({ EmployeeId: emp_id });
    console.log(empDetails, "kuuuuuuuuuuuuuuuuuuuuuu");
    let prevBalance = empDetails.balance;
    let prevWallet = empDetails.wallet;
    let updatedBalance;
    let updatedWallet;
    let val = prevBalance - payment - prevWallet;
    if (val < 0) {
      updatedWallet = -val;
      updatedBalance = 0;
    } else {
      updatedWallet = 0;
      updatedBalance = val;
    }
    await EmpModel.findByIdAndUpdate(empDetails._id, {
      balance: updatedBalance,
      wallet: updatedWallet,
    });

    let userDetails = await EmpModel.findOne({ EmployeeId: emp_id });

    const formattedTime = userDetails.updatedAt
      .toLocaleTimeString()
      .replaceAll("/", "-");

    const formattedDate = userDetails.updatedAt
      .toLocaleDateString()
      .replaceAll("/", "-");

    let fullName = `${userDetails.FirstName}`;
    if (userDetails.LastName) fullName += ` ${userDetails.LastName}`;

    const result = new walletModel({
      emp_id: emp_id,
      fullName: fullName,
      previousBalance: empDetails.balance,
      priviousWallet: empDetails.wallet,
      payment: payment,
      updatedBalance: userDetails.balance,
      updatedWallet: userDetails.wallet,
      date: formattedDate,
      time: formattedTime,
    });
    console.log(result, "999999999999999");
    result.save();

    return res.status(200).json({
      statusCode: 200,
      message: "Balance updated successfully",
      userDetails,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: err.message,
    });
  }
};

const updateStatus = async (req, res) => {
  let status = req.query.status;
  let { order_id } = req.body;
  try {
    let error = validator.isRequired({ order_id: order_id });
    if (error.length != 0) {
      return res.status(400).json({
        statusCode: 400,
        error: error,
      });
    } else {
      let isOrderIdValid = await orderModel.findOne({ _id: order_id });
      if (!isOrderIdValid) {
        return res.status(400).json({
          statusCode: 400,
          error,
        });
      }
      isOrderIdValid = JSON.parse(JSON.stringify(isOrderIdValid));
      for (let i = 0; i < isOrderIdValid.order_rec.length; i++) {
        let itemDetails = await subMenuModel.findOne({
          _id: isOrderIdValid.order_rec[i].itemId,
        });
        isOrderIdValid.order_rec[i].item_name = itemDetails.item_name;
      }
      let empDetails = await EmpModel.findOne({
        EmployeeId: isOrderIdValid.emp_id,
      });
      if (status === "confirm") {
        await orderModel.findByIdAndUpdate(order_id, { order_status: status });
        if (isOrderIdValid.bill_status === "unpaid") {
          let updateBalance, updatedWallet;
          let amt =
            empDetails.balance +
            (isOrderIdValid.totalBalance - empDetails.wallet);
          if (amt < 0) {
            updatedWallet = -amt;
            updateBalance = 0;
          } else {
            updatedWallet = 0;
            updateBalance = amt;
          }

          await EmpModel.findByIdAndUpdate(empDetails._id, {
            balance: updateBalance,
            wallet: updatedWallet,
          });
        }

        const io = req.io;
        console.log("Global socketIds:", global.socketIds);

        const targetSockets = global.socketIds.filter(
          (entry) => entry.userId == empDetails.EmployeeId
        );

        console.log("EmployeeId:", empDetails.EmployeeId);
        console.log("Target Sockets:", targetSockets);

        const message = `${empDetails.FirstName} your order has been confirm`;

        if (targetSockets.length > 0) {
          targetSockets.forEach((targetSocket) => {
            io.to(targetSocket.socketId).emit("notification", message);
            console.log(
              `Notification sent to user with ID: ${empDetails.EmployeeId}`
            );

            // Save the notification to the database
            const result = new Notification({
              userId: targetSocket.userId,
              message,
            });

            result
              .save()
              .then((savedNotification) => {
                console.log(
                  "Notification saved to the database:",
                  savedNotification
                );
              })
              .catch((error) => {
                console.error(
                  "Error saving notification to the database:",
                  error
                );
              });
          });
        } else {
          console.log(`User with ID ${empDetails.EmployeeId} not found.`);
        }

        await confirmOrder(empDetails.email, isOrderIdValid); // send mail to user
        return res.status(200).json({
          statusCode: 200,
          message: "User order is confirmed",
        });
      } else if (status === "cancelled") {
        await orderModel.findByIdAndUpdate(order_id, { order_status: status });

        const io = req.io;
        console.log("Global socketIds:", global.socketIds);

        const targetSockets = global.socketIds.filter(
          (entry) => entry.userId == empDetails.EmployeeId
        );

        console.log("EmployeeId:", empDetails.EmployeeId);
        console.log("Target Sockets:", targetSockets);
        const message = `${empDetails.FirstName} your order has been cancelled.`;

        if (targetSockets.length > 0) {
          targetSockets.forEach((targetSocket) => {
            io.to(targetSocket.socketId).emit("notification", message);
            console.log(
              `Notification sent to user with ID: ${empDetails.EmployeeId}`
            );
            // Save the notification to the database
            const result = new Notification({
              userId: targetSocket.userId,
              message,
            });
            result
              .save()
              .then((savedNotification) => {
                console.log(
                  "Notification saved to the database:",
                  savedNotification
                );
              })
              .catch((error) => {
                console.error(
                  "Error saving notification to the database:",
                  error
                );
              });
          });
        } else {
          console.log(`User with ID ${empDetails.EmployeeId} not found.`);
        }

        await rejectOrder(empDetails.email, isOrderIdValid); // send mail to user

        return res.status(200).json({
          statusCode: 200,
          message: "Order has been cancelled.",
        });
      } else {
        return res.status(400).json({
          statusCode: 400,
          error: "Invalid user status.",
        });
      }
    }
  } catch (error) {
    console.log(error, "err---->");
    return res.status(404).json({ error: error.message });
  }
};

const pendingOrderList = async (req, res) => {
  const currentPage = parseInt(req.query.currentPage, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    let orderStatus = req.query.orderStatus;
    if (!orderStatus) {
      orderStatus = "pending";
    } else if (
      orderStatus != "confirm" &&
      orderStatus != "pending" &&
      orderStatus != "cancelled"
    ) {
      return res.status(400).json({
        statusCode: 400,
        error: "Invalid order status.",
      });
    }
    let today = new Date();
    today = today.toLocaleDateString().replaceAll("/", "-");
    console.log(today, "1111111111111");

    const totalRecords = await orderModel
      .find({
        order_status: orderStatus,
        date: today,
      })
      .countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    const pendingOrder = await orderModel
      .find({
        order_status: orderStatus,
        date: today,
      })
      .skip((currentPage - 0) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const data = await orderModel.deleteMany({
      date: { $lt: today }, // Match dates smaller than "28-10-023"
      order_status: "pending", // Match status equal to "pending"
    });
    console;
    return res.status(200).json({
      statusCode: 200,
      message: "Pending order list fetched successfully",
      data: pendingOrder,
      currentPage,
      totalPages,
      totalRecords,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      error: "Failed to retrieve pending orders",
    });
  }
};

// const listOrder = async (req, res) => {
//   try {
//     const search = req.query.search;
//     const currentPage = parseInt(req.query.currentPage, 10) || 0;
//     const limit = parseInt(req.query.limit, 10) || 10;

//     let query;

//     if (!search) {
//       query = {};
//     } else if (!isNaN(search)) {
//       query = {
//         $or: [{ emp_id: Number(search) }, { totalBalance: Number(search) }],
//       };
//     } else if (search.toLowerCase() === "paid") {
//       query = { bill_status: "paid" };
//     } else {
//       query = {
//         $or: [
//           { "order_rec.item_name": { $regex: new RegExp(search, "i") } },
//           { date: { $regex: new RegExp(search, "i") } },
//           { bill_status: { $regex: new RegExp(search, "i") } },
//           { order_status: { $regex: new RegExp(search, "i") } },
//           { fullName: { $regex: new RegExp(search, "i") } },
//         ],
//       };
//     }

//     const totalRecords = await orderModel.countDocuments(query);

//     const totalPages = Math.ceil(totalRecords / limit);

//     const items = await orderModel
//       .find(query)
//       .sort({ createdAt: -1 })
//       .skip((currentPage - 0) * limit)
//       .limit(limit);

//     if (items.length === 0) {
//       return res.status(200).json({
//         statusCode: 200,
//         success: false,
//         message: "No items found matching the search criteria.",
//       });
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "order list fetch successfully.",
//       data: items,
//       currentPage,
//       totalPages,
//       totalRecords,
//       limit,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       error: error.message,
//     });
//   }
// };

// const listOrder = async (req, res) => {
//   try {
//     const search = req.query.search;
//     const currentPage = parseInt(req.query.currentPage, 10) || 0;
//     const limit = parseInt(req.query.limit, 10) || 10;

//     let query;

//     if (!search) {
//       query = {};
//     } else if (!isNaN(search)) {
//       query = {
//         $or: [{ emp_id: Number(search) }, { totalBalance: Number(search) }],
//       };
//     } else if (search.toLowerCase() === "paid") {
//       query = { bill_status: "paid" };
//     } else {
//       query = {
//         $or: [
//           { "order_rec.item_name": { $regex: new RegExp(search, "i") } },
//           { date: { $regex: new RegExp(search, "i") } },
//           { bill_status: { $regex: new RegExp(search, "i") } },
//           { order_status: { $regex: new RegExp(search, "i") } },
//           { fullName: { $regex: new RegExp(search, "i") } },
//         ],
//       };
//     }

//     // Date interval filtering
//     // if (req.query.dateInterval) {
//     //   const startDate = moment().startOf(req.query.dateInterval);
//     //   const endDate = moment().endOf(req.query.dateInterval);
//     //   query.date = { $gte: startDate.toDate(), $lte: endDate.toDate() };
//     // }

//     if (req.query.dateInterval) {
//       query.date = {
//         $gte: moment().startOf(req.query.dateInterval).format('MM-DD-YYYY'),
//         $lte: moment().endOf(req.query.dateInterval).format('MM-DD-YYYY')
//       };
//     }

//     const totalRecords = await orderModel.countDocuments(query);

//     // Use totalRecords as the limit when downloading in Excel format
//     const items = await orderModel
//       .find(query)
//       .sort({ createdAt: -1 })
//       .skip((currentPage - 0) * (req.query.download === 'excel' ? totalRecords : limit))
//       .limit(req.query.download === 'excel' ? totalRecords : limit);
//       console.log(items,"itemsssssssssssssssssssssssss");

//     if (items.length === 0) {
//       return res.status(200).json({
//         statusCode: 200,
//         success: false,
//         message: "No items found matching the search criteria.",
//       });
//     }

//     // If a download query parameter is present, trigger Excel download
//     if (req.query.download === 'excel') {
//       const workbook = new Excel.Workbook();
//       const worksheet = workbook.addWorksheet('Orders');

//       // Add headers to the worksheet
//       worksheet.addRow(['Order ID', 'Item Name', 'Date', 'Bill Status', 'Order Status', 'Full Name']);

//       // Add data to the worksheet
//       items.forEach(order => {
//         worksheet.addRow([
//           order.order_id,
//           order.order_rec.item_name,
//           order.date,
//           order.bill_status,
//           order.order_status,
//           order.fullName,
//         ]);
//       });

//       // Set response headers for Excel file download
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', 'attachment; filename=order_list.xlsx');

//       // Write the workbook to the response
//       await workbook.xlsx.write(res);

//       // End the response
//       res.end();
//     } else {
//       // Return the regular JSON response if download query parameter is not present
//       return res.status(200).json({
//         statusCode: 200,
//         success: true,
//         message: "Order list fetched successfully.",
//         data: items,
//         currentPage,
//         totalRecords,
//         limit,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       error: error.message,
//     });
//   }
// };

const listOrder = async (req, res) => {
  try {
    const search = req.query.search;

    // console.log(req.emp, "jjjjjjjjjjjjjjjjjjjjj");
    // let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });

    // const search = empDetails.role == "admin" ? req.query.search || req.emp.emp_id: req.emp.emp_id;
    

    const currentPage = parseInt(req.query.currentPage, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;

    let query;

    if (!search) {
      query = {};
    } else if (!isNaN(search)) {
      query = {
        $or: [{ emp_id: Number(search) }, { totalBalance: Number(search) }],
      };
    } else if (search.toLowerCase() === "paid") {
      query = { bill_status: "paid" };
    } else {
      query = {
        $or: [
          { "order_rec.item_name": { $regex: new RegExp(search, "i") } },
          { date: { $regex: new RegExp(search, "i") } },
          { bill_status: { $regex: new RegExp(search, "i") } },
          { order_status: { $regex: new RegExp(search, "i") } },
          { fullName: { $regex: new RegExp(search, "i") } },
        ],
      };
    }

    // Date interval filtering
    if (req.query.dateInterval) {
      const [startDateStr, endDateStr] = req.query.dateInterval.split(" to ");
      const startDate = moment(startDateStr, "MM-DD-YYYY")
        .startOf("day")
        .toDate();
      const endDate = moment(endDateStr, "MM-DD-YYYY").endOf("day").toDate();
      query.date = {
        $gte: moment(startDate).format("MM-DD-YYYY"),
        $lte: moment(endDate).format("MM-DD-YYYY"),
      };
    }
    const totalRecords = await orderModel.countDocuments(query);

    // Use totalRecords as the limit when downloading in Excel format
    const items = await orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(
        (currentPage - 0) *
          (req.query.download === "excel" ? totalRecords : limit)
      )
      .limit(req.query.download === "excel" ? totalRecords : limit);
    console.log(items, "itemsssssssssssssssssssssssss");

    if (items.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        success: false,
        message: "No items found matching the search criteria.",
        data: [],
      });
    }
    // If a download query parameter is present, trigger Excel download
    if (req.query.download === "excel") {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      // Add headers to the worksheet
      worksheet.addRow([
        "Sr No.",
        "Order ID",
        "EmployeeId",
        "Full Name",
        "Bill Status",
        "Order Status",
        "Date",
        "Total Balance",
      ]);

      // Add data to the worksheet
      items.forEach((order, index) => {
        worksheet.addRow([
          index + 1,
          order._id.toString().replace(/,/g, ""),
          order.emp_id,
          order.fullName,
          order.bill_status,
          order.order_status,
          order.date,
          order.totalBalance,
        ]);
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" }, // 'FFFF00' is the hex code for yellow
        };
      });

      // Set the height of rows (adjust as needed)
      worksheet.getRow(1).height = 30; // Set the height of the header row
      items.forEach((order, index) => {
        worksheet.getRow(index + 2).height = 20; // Set the height of other rows
      });

      // Set the width of columns (adjust as needed)
      worksheet.getColumn("A").width = 7;
      worksheet.getColumn("B").width = 30; //orderId
      worksheet.getColumn("C").width = 15; //empID
      worksheet.getColumn("D").width = 20; //FULLNAME
      worksheet.getColumn("E").width = 10; //BSTATUS
      worksheet.getColumn("F").width = 15; //OSTATUS
      worksheet.getColumn("G").width = 15; //date
      worksheet.getColumn("H").width = 15; //TBALACE

      worksheet.eachRow({ includeEmpty: true }, (row) => {
        row.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Set response headers for Excel file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=order_list.xlsx"
      );

      // Write the workbook to the response
      await workbook.xlsx.write(res);

      // End the response
      res.end();
    } else {
      // Return the regular JSON response if the download query parameter is not present
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Order list fetched successfully.",
        data: items,
        currentPage,
        totalRecords,
        limit,
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};

const usersOrder = async (req, res) => {
  const emp_id = req.body.emp_id;
  console.log(emp_id);
  try {
    let error = validator.isRequired({ emp_id: emp_id });
    if (error.length != 0) {
      return res.status(400).json({
        statusCode: 400,
        error: error,
      });
    } else {
      const allOrders = await orderModel.find({ emp_id: emp_id });
      return res.status(200).json({
        statusCode: 200,
        data: allOrders,
      });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const notificationList = async (req, res) => {
  const todayStart = moment().startOf("day");
  const todayEnd = moment().endOf("day");
  console.log(req.emp,"888888888888888888888888888")

  console.log(todayStart, "khushiiiiiiiiiiiiiiiiiiiiii");

  try {
    const userId = req.emp.emp_id;
    const today = new Date();
    console.log(today);

    // Fetch notifications
    const messages = await Notification.find({
      userId: userId,
      timestamp: { $gt: todayStart.toDate(), $lt: todayEnd.toDate() },
    });
    console.log(messages, "lllllllllllllllllllllllll");

    // Delete notifications older than today
    const deleted = await Notification.deleteMany({
      userId: userId,
      timestamp: { $lt: todayStart.toDate() },
    });

    console.log(deleted, "2222222222222222222222222");
    res.status(200).json({
      statusCode: 200,
      success: true,
      messages: "Notifications fetched successfully.",
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching/deleting notifications:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};

// const walletHistory = async (req, res) => {
//   try {
//     const { emp_id } = req.query;
//     console.log(emp_id);

// const user = await EmpModel.findOne({ EmployeeId: emp_id });

// if (!user) {
//   return res.status(404).json({
//     statusCode: 404,
//     error: "User not found",
//   });
// }

// const walletHistory = await walletModel
//   .find({ emp_id })
//   .sort({ createdAt: -1 });

// if (walletHistory.length === 0) {
//   return res.status(200).json({
//     statusCode: 200,
//     message: `Wallet history is empty for ${user.FirstName}`,
//   });
// }

// return res.status(200).json({
//   statusCode: 200,
//   message: `Wallet history fetch successfully for ${user.FirstName}`,
//   data: walletHistory,
// });
//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       error: err.message,
//     });
//   }
// };

const walletHistory = async (req, res) => {
  try {
    console.log(req.emp, "jjjjjjjjjjjjjjjjjjjjj");
    let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });

    const emp_id = empDetails.role == "admin" ? req.query.emp_id || req.emp.emp_id: req.emp.emp_id;

    const user = await EmpModel.findOne({ EmployeeId: emp_id });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        error: "User not found",
      });
    }

    const walletHistory = await walletModel
      .find({ emp_id })
      .sort({ createdAt: -1 });

    if (walletHistory.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Wallet history is empty for ${user.FirstName}`,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: `Wallet history fetch successfully for ${user.FirstName}`,
      data: walletHistory,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: err.message,
    });
  }
};

module.exports = {
  addOrder,
  listOrder,
  updateBalance,
  updateStatus,
  pendingOrderList,
  usersOrder,
  notificationList,
  walletHistory,
};
