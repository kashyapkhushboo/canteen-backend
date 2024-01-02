const { Notification } = require("../../../models/notificationModel");
const moment = require("moment");

const notificationList = async (req, res) => {

    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
  
    try {
      const userId = req.emp.emp_id;
      const today = new Date();
  
      // Fetch notifications
      const messages = await Notification.find({
        userId: userId,
        timestamp: { $gt: todayStart.toDate(), $lt: todayEnd.toDate() },
      }).sort({ timestamp: -1 }).limit(5)

      // Delete notifications older than today
      const deleted = await Notification.deleteMany({
        userId: userId,
        timestamp: { $lt: todayStart.toDate() },
      }).sort({ timestamp: -1 })

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