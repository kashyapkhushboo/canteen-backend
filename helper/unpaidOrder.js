const updateEmployeeBalances = async (employee, newOrder, res) => {
    try {
      if (
        typeof employee.balance === "number" &&
        typeof employee.wallet === "number"
      ) {
        let updateBalance, updatedWallet;
        let amt =
          employee.balance + (newOrder.totalBalance - employee.wallet);
  
        if (!isNaN(amt) && isFinite(amt)) {
          if (amt < 0) {
            updatedWallet = -amt;
            updateBalance = 0;
          } else {
            updatedWallet = 0;
            updateBalance = amt;
          }
  
          await EmpModel.findByIdAndUpdate(employee._id, {
            balance: updateBalance,
            wallet: updatedWallet,
          });
        } else {
          return res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Invalid calculation for balance update.",
          });
        }
      } else {
        // Handle the case where balance or wallet is not a number
        return res.status(500).json({
          statusCode: 500,
          success: false,
          message: "Invalid data in employee document.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };
  
  module.exports = {updateEmployeeBalances}