const { EmpModel } = require("../../models/empDetailsModel");
const { orderModel } = require("../../models/ordersModel");
const { subMenuModel } = require("../../models/subMenuModel");

const count = async (req, res, next) => {
  try {
    let totalUsers = await EmpModel.countDocuments();

    let totalMenuItems = await subMenuModel.countDocuments();

    const [pendingOrder, rescentData, totalOrders, mostOrderItem] =
      await Promise.all([
        orderModel.countDocuments({ order_status: "pending" }),
        orderModel.find({ order_status: "pending" }).limit(5),
        orderModel.countDocuments(),
        orderModel
          .aggregate([
            {
              $match: {
                order_status: "confirm",
              },
            },
            {
              $unwind: "$order_rec",
            },
            {
              $group: {
                _id: "$order_rec.item_name",
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                count: -1,
              },
            },
          ])
          .exec(),
      ]);

    return res.status(200).json({
      statusCode: 200,
      message: "Details fetched successfully.",
      data: [
        {
          total_users: totalUsers,
          total_orders: totalOrders,
          pendingOrder: pendingOrder,
          mostOrderItem: mostOrderItem,
          today_menu_items: totalMenuItems,
          recent_pending_orders: rescentData,
        },
      ],
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: err.message,
    });
  }
};

module.exports = { count };
