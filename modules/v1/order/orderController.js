const {
  confirmOrder,
} = require("../../../views/emailTemplate/confirmOrderNotification");
const { rejectOrder } = require("../../../views/emailTemplate/rejectOrder");
const validator = require("../../../helper/validations");
const { EmpModel } = require("../../../models/empDetailsModel");
const { orderModel } = require("../../../models/ordersModel");
const { subMenuModel } = require("../../../models/subMenuModel");
const { Notification } = require("../../../models/notificationModel");



const Excel = require("exceljs");

const addOrder = async (req, res) => {
  try {
    let orderDetails = req.body;

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

        if (orderData.order_rec[i].itemId) {
          // If itemId is present, validate using itemId
          isSubMenuValid = await subMenuModel.findOne({
            _id: orderData.order_rec[i].itemId,
          });

        } else {
          // If itemId is not present, validate using menuId and item_name
          isSubMenuValid = await subMenuModel.findOne({
            menu_id: orderData.order_rec[i].menu_id,
            item_name: orderData.order_rec[i].item_name,
          });
        }

        if (!isSubMenuValid) {
          return res
            .status(400)
            .json({
              error: `Item '${orderData.order_rec[i].item_name}' you have added in the order is invalid.`,
            });
        }

        let perItemBalance =
          isSubMenuValid.price * orderDetails.order_rec[i].quantity;
        orderData.order_rec[i]["price"] = isSubMenuValid.price;
        orderData.order_rec[i]["totalPrice"] = perItemBalance;
        orderData.order_rec[i]["item_name"] = isSubMenuValid.item_name;
        totalBalance = totalBalance + perItemBalance;
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

        const targetSockets = global.socketIds.filter(
          (entry) => entry.userId == userDetails.EmployeeId
        );

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

        const adminEmployeeIds = await EmpModel.find({
          role: "admin",
        }).distinct("EmployeeId");

        const targetSockets = global.socketIds.filter((entry) =>
          adminEmployeeIds.includes(Number(entry.userId))
        );

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

const listOrder = async (req, res) => {
  try {
    // const search = req.query.search;

    console.log(req.emp, "jjjjjjjjjjjjjjjjjjjjj");
    let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });

    const search = empDetails.role == "admin" ? req.query.search || req.emp.emp_id: req.emp.emp_id;

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

module.exports = {
  addOrder,
  listOrder,
  updateStatus,
  pendingOrderList,
};
