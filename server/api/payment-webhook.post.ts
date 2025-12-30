import { verifyOrderNotification } from "../utils/_payment.js";

const validSourceIps = ["35.156.245.42", "35.156.159.169"];

export default defineEventHandler(async (event) => {
  const forwardedFor = event.headers.get("x-forwarded-for");
  if (forwardedFor != null) {
    const ips = forwardedFor.split(",");
    if (!ips.some((ip) => validSourceIps.includes(ip))) {
      return createError({
        statusCode: 400,
        statusMessage: "Invalid source IP for webhook",
      });
    }
  } else {
    console.warn("No x-forwarded-for header");
  }

  const body = await readBody(event);
  const token = verifyOrderNotification(null, body.orderToken);

  console.log("=== MONTONIO WEBHOOK RECEIVED ===");
  console.log("Headers:", event.headers);
  console.log("Body:", body);
  console.log("Decoded:", token);
  console.log("Query:", getQuery(event));
  console.log("URL:", event.path);
  console.log("================================");

  return { success: true, message: "Webhook received and logged" };
});
