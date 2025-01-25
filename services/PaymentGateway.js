import { claerStatusR } from "./claerStatusR.js";
import { getChargeDetails } from "./getChargeDetails.js";
import { AddHisPayment } from "./AddHisPayment.js";

export const PaymentGateway = async (chargeId, orderId) => {
  try {
    console.log(`Processing chargeId: ${chargeId}, orderId: ${orderId}`);

    const utcTime = new Date(); // เวลาปัจจุบันใน UTC
    const bangkokTime = new Date(utcTime.getTime() + 7 * 60 * 60 * 1000); // เพิ่ม 7 ชั่วโมง
    console.log("Bangkok Time:", bangkokTime);

    if (!chargeId || !orderId) {
      console.error("Invalid charge ID or order ID");
      await claerStatusR({
        orderId,
        chargeId,
        Remark: "ตรวจสอบพบมีการสร้าง Order แต่ยังไม่ได้กดปุ่มชำระเงิน",
        time: bangkokTime, // ใช้เวลาที่แปลงแล้ว
        name: "System",
      });
      return { success: false, message: "Invalid charge ID or order ID." };
    }

    const chargeDetails = await getChargeDetails(chargeId);

    if (!chargeDetails.success) {
      throw new Error(chargeDetails.error || "Failed to get charge details");
    }

    const { paid, amount, source, paid_at, failure_code } = chargeDetails.data;
    console.log("paid, amount, source, paid_at, failure_code", paid, amount, source?.type, paid_at, failure_code);

    if (paid) {
      const PaymentMethod = source?.type || "Unknown";
      const result = await AddHisPayment({
        orderId,
        amount: amount / 100,
        PaymentMethod,
        chargeId,
        ref_number1: source?.provider_references?.reference_number_1 || "",
        time_paid: paid_at,
      });

      if (result.success) {
        console.log("Payment added successfully.");
      } else {
        console.error("Failed to add payment:", result.error);
      }
    } else if (failure_code) {
      console.warn(`Payment failed with reason: ${failure_code}`);
      await claerStatusR({
        orderId,
        chargeId,
        Remark: "ตรวจสอบการจ่ายเป็น Pendding ใน Payment Gateway",
        time: bangkokTime, // ใช้เวลาที่แปลงแล้ว
        name: "ระบบ",
      });
    } else {
      await claerStatusR({
        orderId,
        chargeId,
        Remark: "ตรวจสอบการจ่ายเป็น Pendding ใน Payment Gateway",
        time: bangkokTime, // ใช้เวลาที่แปลงแล้ว
        name: "ระบบ",
      });
    }
  } catch (error) {
    console.error("Error in PaymentGateway:", error.message || error);
  }
};
