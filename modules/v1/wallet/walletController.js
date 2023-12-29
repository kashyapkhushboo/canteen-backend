const { walletModel } = require("../../../models/walletHistory");
const { EmpModel } = require("../../../models/empDetailsModel");

const walletHistory = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.currentPage, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;

    let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });

    const emp_id =
      empDetails.role == "admin"
        ? req.query.emp_id || req.emp.emp_id
        : req.emp.emp_id;

    const totalRecords = await EmpModel.findOne({
      EmployeeId: emp_id,
    }).countDocuments();

    const totalPages = Math.ceil(totalRecords / limit);
    const user = await EmpModel.findOne({ EmployeeId: emp_id })
      .skip((currentPage - 0) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

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
      currentPage,
      totalPages,
      totalRecords,
      limit,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: err.message,
    });
  }
};
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

module.exports = {
  walletHistory,
  updateBalance,
};
