import cron from "node-cron";
import { getChargeIdsFromDB } from "./services/getChargeIdsFromDB.js"; 
import { PaymentGateway } from "./services/PaymentGateway.js"; 


// ตั้งค่า Cron Job ให้รันทุก 15 นาที
cron.schedule("* * * * *", async () => {
  console.log("Starting Cron Job at", new Date().toLocaleTimeString());

  try {
    const chargeData = await getChargeIdsFromDB();

    if (!chargeData || chargeData.length === 0) {
      console.log("No charge IDs found for today.",chargeData);
      return;
    }

    console.log(`Found ${chargeData.length} charge data:`, chargeData);

    // // เรียกใช้ PaymentGateway สำหรับแต่ละ chargeData
    for (const { orderId, chargeId } of chargeData) {
      await PaymentGateway(chargeId, orderId);
    }
  } catch (error) {
    console.error("Error in Cron Job:", error.message || error);
  }
});
