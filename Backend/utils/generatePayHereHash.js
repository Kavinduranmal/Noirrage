import crypto from "crypto";

export function generatePayHereHash({ merchant_id, order_id, amount, currency, merchant_secret }) {
  const formattedAmount = parseFloat(amount).toFixed(2);
  const hashedSecret = crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase();
  const raw = merchant_id + order_id + formattedAmount + currency + hashedSecret;
  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
}
