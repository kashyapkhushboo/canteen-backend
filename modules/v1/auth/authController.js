const { EmpModel } = require("../../../models/empDetailsModel");
const validator = require("../../../helper/validations");
let jwt = require("jsonwebtoken");
require("dotenv").config();

const { otpModel } = require("../../../models/otpModel");
const crypto = require("crypto-js");
const { sendEmail } = require("../../../views/emailTemplate/sendOtp");

const login = async (req, res) => {
  try {
    const { emp_id } = req.body;
    let error = validator.isRequired({ emp_id: emp_id });
    if (error.length != 0) {
      return res.status(400).json({
        statusCode: 400,
        error: error,
      });
    } else {
      let empExists = await EmpModel.findOne({ EmployeeId: emp_id });

      if (!empExists) {
        return res.status(403).json({
          statusCode: 403,
          error: "Invalid employee id.",
        });
      }
      let otpDetails = await sendEmail(empExists.email);
      if (otpDetails.error) {
        return res.status(400).json({
          statusCode: 400,
          error: otpDetails.error,
        });
      } else {
        let isOtpExists = await otpModel.findOne({ emp_id: emp_id });
        if (isOtpExists) {
          await otpModel.findByIdAndUpdate(isOtpExists._id, {
            otp: otpDetails.otp,
          });
        } else {
          let otpData = new otpModel({
            email_id: empExists.email,
            otp: otpDetails.otp,
            emp_id: emp_id,
          });
          await otpData.save();
        }
        return res.status(200).json({
          statusCode: 200,
          message: "success",
          data: { emp_id: emp_id },
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
};

const listUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const currentPage = parseInt(req.query.currentPage, 10) || 0;

    const search = req.query.search;

    let query;
    if (!search) {
      query = {};
    } else if (!isNaN(search)) {
      query = {
        $or: [
          { EmployeeId: Number(search) },
          { wallet: Number(search) },
          { balance: Number(search) },
        ],
      };
    } else {
      query = {
        $or: [
          { FirstName: { $regex: new RegExp(search, "i") } },
          { LastName: { $regex: new RegExp(search, "i") } },
        ],
      };
    }

    const totalRecords = await EmpModel.countDocuments(query);

    const totalPages = Math.ceil(totalRecords / limit);

    const list = await EmpModel.find(query)
      .skip((currentPage - 0) * limit)
      .limit(limit);

    if (list.length == 0) {
      return res.status(200).json({
        statusCode: 200,
        success: false,
        message: "No items found matching the search criteria.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "employee list fetch successfully",
      data: list,
      currentPage,
      totalPages,
      totalRecords,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      error: error.message,
    });
  }
};
const viewUser = async (req, res) => {
  try {
    console.log(req.emp, "jjjjjjjjjjjjjjjjjjjjj");
    let empDetails = await EmpModel.findOne({ EmployeeId: req.emp.emp_id });

    const emp_id =
      empDetails.role == "admin"
        ? req.query.emp_id || req.emp.emp_id
        : req.emp.emp_id;
    console.log(emp_id, "khushiiiiiiiiiiii");
    if (!emp_id) {
      return res.status(403).json({
        statusCode: 403,
        error: "Employee id is required.",
      });
    }
    const userDetail = await EmpModel.findOne({ EmployeeId: emp_id });
    console.log(userDetail, "ooooooooooooooooo");
    if (userDetail) {
      return res.status(200).json({
        statusCode: 200,
        message: "User Details fetched successfully.",
        data: userDetail,
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
};
const createUser = async (req, res) => {
  let { emp_id, first_name, last_name, role, email } = req.body;
  let requiredFeilds;
  try {
    requiredFeilds = {
      emp_id: emp_id,
      first_name: first_name,
      role: role,
      email: email,
    };
    let error = validator.isRequired(requiredFeilds);
    if (error.length != 0) {
      return res.status(400).json({
        statusCode: 400,
        error: error,
      });
    } else {
      const userDetail = await EmpModel.findOne({ EmployeeId: emp_id });
      if (userDetail) {
        return res.status(403).json({
          statusCode: 403,
          error: "This emp id already exists please choose another one.",
        });
      }

      let userDetails = {
        EmployeeId: emp_id,
        FirstName: first_name,
        LastName: last_name,
        role: role,
        email: email,
      };

      let newUser = new EmpModel(userDetails);
      let result = await newUser.save();
      return res.status(200).json({
        message: "User  added successfully.",
        data: result,
      });
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};
const verifyOTP = async (req, res) => {
  try {
    //  let emp_id = req.emp.emp_id;
    const { otp, emp_id } = req.body;
    let requiredFeilds = {
      emp_id: emp_id,
      otp: otp,
    };
    let error = validator.isRequired(requiredFeilds);
    if (error.length != 0) {
      return res.status(403).json({
        statusCode: 403,
        error: error,
      });
    } else {
      let empDetails = await EmpModel.findOne({ EmployeeId: emp_id });
      let result = await otpModel.findOne({ emp_id: emp_id });
      if (!result) {
        return res
          .status(400)
          .json({ success: false, message: "Please try to login again" });
      }

      const createAuthToken = () => {
        const token = jwt.sign(
          { user_id: empDetails._id, emp_id },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2400h",
          }
        );
        console.log(token, "ennnnnnnnnnnnnnnnnnnnnn");
        return encodeURIComponent(
          crypto.AES.encrypt(token, process.env.TOKEN_KEY).toString()
        );
      };

      const token = createAuthToken(); // Call the function to get the token

      console.log(token, "tokennnnnnnnnnn");

      // const token = jwt.sign(
      //   { user_id: empDetails._id, emp_id },
      //   process.env.TOKEN_KEY,
      //   {
      //     expiresIn: "2400h",
      //   }
      // );
      if (result.count >= 3) {
        await otpModel.deleteMany({ email_id: empDetails.email });
        return res.status(400).json({
          error: `You have enter wrong otp ${result.count} times, Please try to login again.`,
        });
      }
      let isOtpMatched = await otpModel.findOne({
        email_id: empDetails.email,
        otp: otp,
      });
      if (isOtpMatched) {
        await otpModel.deleteMany({ email_id: empDetails.email });

        empDetails = JSON.parse(JSON.stringify(empDetails));

        if (empDetails.role === "user") {
          empDetails = await EmpModel.findOne({ EmployeeId: emp_id }).select(
            "-role"
          );
        }
        return res.status(200).json({
          statusCode: 200,
          success: true,
          message: "OTP verified successfully.",
          data: { token: token, empDetails: { role: empDetails.role } },
        });
      } else {
        let newCount = result.count + 1;
        await otpModel.findByIdAndUpdate(result._id, { count: newCount });

        return res
          .status(400)
          .json({ success: false, message: "Invalid otp, please try again." });
      }
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: err.message,
    });
  }
};
const deleteUser = async (req, res, next) => {
  let emp_id = req.query.emp_id;
  try {
    let isEmpExists = await EmpModel.findOne({ EmployeeId: emp_id });
    console.log(isEmpExists, "kkkkkkkkkkkkkkkkkkkkkkkkkkk");
    if (isEmpExists) {
      await EmpModel.findByIdAndRemove(isEmpExists._id);
      return res
        .status(200)
        .json({ statusCode: 200, message: "Employee deleted successfully" });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Invalid employee id",
      });
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
};
const updateUser = async (req, res) => {
  const _id = req.query.id;
  const data = req.body;
  console.log(data);

  try {
    const isIdValid = await EmpModel.findOne({ _id });
    if (!isIdValid) {
      return res.status(403).json({ message: "Invalid Id" });
    } else {
      const user = await EmpModel.findByIdAndUpdate(_id, data);
      return res.status(200).json({ message: "User updated successfully" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  login,
  listUsers,
  viewUser,
  createUser,
  verifyOTP,
  deleteUser,
  updateUser,
};
