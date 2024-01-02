const { walletHistory, updateBalance } = require("./walletController");

const walletRoutes = require("express").Router();

walletRoutes.get("/wallet-history", walletHistory);
walletRoutes.post("/update-balance", updateBalance);

module.exports = walletRoutes;
