// tokenUtils.js

const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
require("dotenv").config();

const decodeToken = (token) => {
  try {
    // Step 1: Decode URI component
    const uriDecodedToken = decodeURIComponent(token);

    // Step 2: Decrypt using AES
    const decryptedTokenBytes = crypto.AES.decrypt(
      uriDecodedToken,
      process.env.TOKEN_KEY
    );

    // Convert decrypted bytes to a string
    const decryptedToken = decryptedTokenBytes.toString(crypto.enc.Utf8);

    // Verify JWT
    const decoded = jwt.verify(decryptedToken, process.env.TOKEN_KEY);


    return decoded;
  } catch (err) {
    throw new Error('Token decoding failed');
  }
};

module.exports = {
  decodeToken,
};
