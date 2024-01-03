const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  quantity: {
    required: true,
    type: Number,
  },
  itemId: {
    // required: true,
    type: String,
  },
  price: {
    required: true,
    type: Number,
  },
  item_name: {
    required: true,
    type: String,
  },
  totalPrice: {
    type: Number,
    default: function () {
      return this.quantity * this.price;
    },
  },
});

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },

    emp_id: {
      type: Number,
      required: true,
    },
    menu_id: {
      type: mongoose.Schema.ObjectId,
      ref: "menuCategory",
    },
    //pending or confirm
    order_status: {
      type: String,
      enum: ["pending", "confirm", "cancelled"],
      required: true,
    },
    //paid or unpaid
    bill_status: {
      type: String,
      enum: ["paid", "unpaid"],
      required: true,
    },
    date: {
      required: true,
      type: Date,
    },
    time: {
      required: true,
      type: String,
      default: () => {
        const today = new Date();
        const options = { timeZone: "Asia/Kolkata", hour12: false };
        const timeInIndia = today.toLocaleTimeString("en-IN", options);
        return timeInIndia;
      },
    },
    order_rec: [orderItemSchema],

    totalBalance: {
      type: Number,
      default: function () {
        return this.order_rec.reduce((acc, item) => acc + item.totalPrice, 0);
      },
    },
  },
  {
    timestamps: true,
  }
);
const orderModel = mongoose.model("order", orderSchema);
module.exports = { orderModel };
