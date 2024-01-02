const { Notification } = require("../../../models/notificationModel");
const moment = require("moment");

const notificationList = async (req, res) => {

    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    console.log(req.emp, "888888888888888888888888888");
  
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
  
  module.exports ={
    notificationList
  }