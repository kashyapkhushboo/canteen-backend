// verifyToken.js

const { decodeToken } = require('../helper/tokenUtils');

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized user" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ message: "A token is required for authentication." });
  }

  try {
    const decoded = decodeToken(token);

    // Attach the decoded user to the request object
    req.emp = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized user" });
  }
};

module.exports = verifyToken;
