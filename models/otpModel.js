const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email_id: {
    required: true,
    type: String,
  },
  emp_id: {
    required: true,
    type: Number,
  },
  otp: {
    required: true,
    type: String,
  },
  count: {
    default: 0,
    type: Number,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    // Set the expiration to 5 minutes (300,000 milliseconds)
    index: { expires: 300 },
  },
}, {
  timestamps: true,
});

const otpModel = mongoose.model('otpDetails', otpSchema);

module.exports = { otpModel };
