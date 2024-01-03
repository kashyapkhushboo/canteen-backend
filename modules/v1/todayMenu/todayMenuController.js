//============================REQUIRE MONGOOSE====================================================================
const { dailyMenuModel } = require("../../../models/dailyMenuModel");
const validator = require("../../../helper/validations");
const { menuModel } = require("../../../models/menuModel");
const { subMenuModel } = require("../../../models/subMenuModel");
const { EmpModel } = require("../../../models/empDetailsModel");
const {Notification} = require("../../../models/notificationModel")

// const updateTodayMenu = async (req, res, next) => {
//   let { sub_menu_items, menuType } = req.body;
//   const todayMenuId = req.query.id;
//   try {
//     // Check for missing fields
//     let requiredFeilds = {
//       today_menu_id:todayMenuId,
//       sub_menu_items: sub_menu_items,
//       menuType:menuType
//     };
//     let error = validator.isRequired(requiredFeilds);
//     if (error.length != 0) {
//       return res.status(400)
//           .json({
//             statusCode: 400, error: error });
//     } else {
//        // Check if Today menu id is valid
//     const isTodayMenuIdValid = await dailyMenuModel.findOne({_id:todayMenuId,type:menuType});
//     if (!isTodayMenuIdValid) {
//       return res.status(400)
//           .json({
//             statusCode: 400, error: "Invalid today menu id or menu type id." });
//     }
//     sub_menu_items = sub_menu_items.filter( function( item, index, inputArray ) {
//       return inputArray.indexOf(item) == index;
//   });
//     // Check if menuType is valid
//     const typeExists = await menuModel.findById(menuType);
//     if (!typeExists) {
//       return res.status(400)
//           .json({
//             statusCode: 400, error: "Invalid type id." });
//     }
//     // Check if menu_items are valid
//     for (let i = 0; i < sub_menu_items.length; i++) {
//       const isSubMenuIdValid = await subMenuModel.findOne({ _id: sub_menu_items[i], menu_id: menuType });
//       if (!isSubMenuIdValid) {
//         return res.status(400)
//           .json({
//             statusCode: 400, error: `Item you are trying to update in today's menu is invalid.` });
//       }
//     }
//     const data = {
//       sub_menu_items: sub_menu_items,
//       type: menuType,
//     };
//     // Update the menu items
//     let result = await dailyMenuModel.findByIdAndUpdate(todayMenuId, data);
//     return res.status(200)
//           .json({
//             statusCode: 200,
//       message: `Today's menu for ${typeExists.title} has been updated successfully`,
//       data: result,
//     });
//   }
//   } catch (err) {
//     return res.status(400)
//           .json({
//             statusCode: 400, message: err.message });
//   }
// };

const addTodayMenu = async (req, res, next) => {
  console.log("uwtdggdgjgdjsd");
  let { sub_menu_items, menuType } = req.body;
  console.log("-----------------", req.body);
  try {
    let requiredFeilds = {
      sub_menu_items: sub_menu_items,
      menuType: menuType,
    };
    let error = validator.isRequired(requiredFeilds);
    if (error.length != 0) {
      return res.status(400).json({
        statusCode: 400,
        error: error,
      });
    } else {
      sub_menu_items = sub_menu_items.filter(function (
        item,
        index,
        inputArray
      ) {
        return inputArray.indexOf(item) == index;
      });
      // Check if menuType is valid
      const typeExists = await menuModel.findById(menuType);
      if (!typeExists) {
        return res.status(400).json({
          statusCode: 400,
          error: "Invalid type id.",
        });
      }
      // Check if today's menu already exists
      const today = new Date();
      const formattedDate = today.toLocaleDateString().replaceAll("/", "-"); // today.toISOString().split('T')[0];
      console.log(`${formattedDate} and ${menuType}`);
      const dailyMenu = await dailyMenuModel.findOne({
        date: formattedDate,
        type: menuType,
      });
      if (dailyMenu) {
        return res.status(400).json({
          statusCode: 400,
          message: `Menu for ${typeExists.title} is already created for today.`,
        });
      }
      // Check if menu_items are valid
      for (let i = 0; i < sub_menu_items.length; i++) {
        console.log(`${sub_menu_items[i]} and ${menuType}`);
        const isSubMenuIdValid = await subMenuModel.findOne({
          _id: sub_menu_items[i],
          menu_id: menuType,
        });
        console.log(isSubMenuIdValid);
        if (!isSubMenuIdValid) {
          return res.status(400).json({
            statusCode: 400,
            error: `Item you have added in today's menu is invalid.`,
          });
        }
      }
      const data = {
        sub_menu_items: sub_menu_items,
        type: menuType,
      };
      const todayMenuRecord = new dailyMenuModel(data);
      const result = await todayMenuRecord.save();

      const io = req.io;

      console.log("Global socketIds:", global.socketIds);

      const adminEmployeeIds = await EmpModel.find({
        role: "admin",
      }).distinct("EmployeeId");
      console.log(adminEmployeeIds, "adminnnnnnnnnnnnnnnnnnn");
      // Instead of filtering admin users, filter non-admin users
      const targetSockets = global.socketIds.filter(
        (entry) => !adminEmployeeIds.includes(Number(entry.userId))
      );

      console.log("EmployeeId:", adminEmployeeIds);
      console.log("Target Sockets:", targetSockets);

      if (targetSockets.length > 0) {
        const message =  `Menu for ${typeExists.title} is added successfully for today.` ;

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
        console.log(`No matching non-admin users found in targetSockets.`);
      }

      // const io = req.io;
      // io.emit('notification', 'Please Check Menu added for today')

      return res.status(200).json({
        statusCode: 200,
        message: "Today's menu added successfully",
        data: result,
      });
    }
  } catch (err) {
    return res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
  }
};

const listTodayMenu = async (req, res, next) => {
  try {
    const date = req.query.date;
    const todayDate =
      date || new Date().toLocaleDateString().replace(/\//g, "-");
    const message = date
      ? `Menu items for the date: ${date} fetched successfully.`
      : "Menu items for today are fetched successfully";
    const menus = await menuModel.find(
      {},
      "_id time title createdAt updatedAt"
    );
    const result = [];
    for (const menu of menus) {
      const items = await dailyMenuModel.findOne(
        { type: menu._id, date: todayDate },
        "sub_menu_items type date time createdAt updatedAt"
      );

      const subItems = items
        ? await subMenuModel.find(
            { _id: { $in: items.sub_menu_items } },
            "item_name price quantity createdAt updatedAt"
          )
        : [];

      let today_menu_id;
      if (items != null) {
        today_menu_id = items._id;
      } else {
        today_menu_id = "";
      }
      result.push({
        _id: menu._id,
        today_menu_id: today_menu_id,
        title: menu.title,
        time: menu.time,
        items: items ? subItems : [], // items: items ? { ...items.toObject(), menu_items_details: subItems } : [],
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: message,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};

const deleteTodayMenu = async (req, res, next) => {
  let todayMenuId = req.query.id;
  try {
    const isDailyMenuExists = await dailyMenuModel.findByIdAndRemove(
      todayMenuId
    );

    if (isDailyMenuExists) {
      let menuDetails = await menuModel.findOne({
        _id: isDailyMenuExists.type,
      });

      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: `Today ${menuDetails.title} menu deleted successfully`,
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Invalid today menu ",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};

module.exports = { addTodayMenu, listTodayMenu, deleteTodayMenu };
