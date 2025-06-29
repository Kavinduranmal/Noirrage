const crypto = require("crypto");

const merchantId = "243630"; // your merchant ID
const orderId = "ORDER_686154dda9300b1c2f8618bd"; // full ORDER_ ID
const amount = "2500.00";
const currency = "LKR";
const statusCode = "2";
const merchantSecret = "2593653674155692546334836575832156367575"; // from your .env

const hashedSecret = crypto
  .createHash("md5")
  .update(merchantSecret)
  .digest("hex")
  .toUpperCase();

const rawSignature = merchantId + orderId + amount + currency + statusCode + hashedSecret;

const md5sig = crypto
  .createHash("md5")
  .update(rawSignature)
  .digest("hex")
  .toUpperCase();

console.log("✅ Your md5sig for Postman test:", md5sig);
