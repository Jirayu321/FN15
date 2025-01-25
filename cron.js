import cron from "node-cron";
import { getChargeIdsFromDB } from "./services/getChargeIdsFromDB.js"; 
import { PaymentGateway } from "./services/PaymentGateway.js"; 

// const PaymentGateway = async (chargeId) => {
//     console.log("orderDetail.at(0)", orderDetail.at(0));
//     console.log("chargeId", chargeId);
//     const time = new Date();
//     console.log(`Current time is: ${time.toLocaleTimeString()}`);
//     const savedLocale = JSON.parse(localStorage.getItem("emmp") || "{}");
//     const name = savedLocale?.Emp_Name || "Unknown";
//       console.log("name", name);
//     if (!chargeId) {
//       console.error("Invalid charge ID");
//       Swal.fire({
//         icon: "warning",
//         text: "ตรวจสอบพบมีการสร้าง Order แต่ยังไม่ได้กดปุ่มชำระเงินคุณต้องการยกเลิกคำสั่งซื้อหรือไม่",
//         showCancelButton: true,
//         confirmButtonText: "ตกลง",
//         cancelButtonText: "ปิด",
//       }).then(async (result) => {
//         if (result.isConfirmed) {
//           const orderId = orderDetail.at(0).Order_id;
//           const Remark = `ตรวจสอบพบมีการสร้าง Order แต่ยังไม่ได้กดปุ่มชำระเงิน`;
//           try {
//             const res = await authAxiosClient?.post("/api/claerStatusR", {
//               orderId,
//               chargeId,
//               Remark,
//               time,
//               name,
//             });
//             console.log("claerStatusR response:", res?.data);
//             SwalSuccess("อัพเดทประวัติการชำระเรียบร้อย");
//             setTimeout(() => {
//               window.location.replace("/all-orders");
//             }, 1500);
//           } catch (error) {
//             console.error("Error in claerStatusR:", error);
//             Swal.fire({
//               icon: "error",
//               text: "เกิดข้อผิดพลาดในการยกเลิกสถานะ",
//             });
//           }
//         } else {
//           console.log("User closed");
//         }
//       });
//       return;
//     }

//     try {
//       const response = await authAxiosClient?.post("/api/getChargeDetails", {
//         chargeId,
//       });
//       console.log("Charge details response:", response);

//       if (response.status !== 200) {
//         throw new Error(
//           `Failed to retrieve charge details, status: ${response.status}`
//         );
//       }

//       const result = response?.data;

//       if (result.success) {
//         console.log("Charge detail:", result?.data);
//         if (result?.data.paid !== false) {
//           const amount = Number(result?.data.amount) / 100;
//           const totalSum = orderDetail.reduce(
//             (acc, order) => acc + order.Total_Price,
//             0
//           );
//           const paymentOption = (amount / totalSum) * 100;
//           const time_paid = result?.data.paid_at;
//           const ref_number1 =
//             (result?.data?.source )?.provider_references
//               ?.reference_number_1 || "";
//           const orderId = orderDetail.at(0).Order_id;
//           const paymentMethod = (result?.data?.source )?.type;
//           const validPaymentMethods = [
//             "mobile_banking_bay",
//             "mobile_banking_bbl",
//             "mobile_banking_ktb",
//             "mobile_banking_kbank",
//             "mobile_banking_scb",
//             "promptpay",
//           ];

//           if (!paymentMethod) {
//             console.log("Payment method is null");
//           } else if (validPaymentMethods.includes(paymentMethod)) {
//             if (paymentMethod === "promptpay") {
//               console.log("promptpay", paymentMethod);
//               const PaymentMethod = "promptpay";
//               const res = await authAxiosClient?.post("/api/AddHisPayment", {
//                 orderId,
//                 orderDetail,
//                 totalSum,
//                 amount,
//                 PaymentMethod,
//                 paymentOption,
//                 time_paid,
//                 chargeId,
//                 ref_number1,
//               });
//               console.log("AddHisPayment response:", res?.data);
//               SwalSuccess("อัพเดทประวัติการชำระเรียบร้อย");
//               setTimeout(() => {
//                 window.location.replace("/all-orders");
//               }, 1500);
//             } else {
//               console.log("E-Banking", paymentMethod);
//               const PaymentMethod = "E-Banking";
//               const res = await authAxiosClient?.post("/api/AddHisPayment", {
//                 orderId,
//                 orderDetail,
//                 totalSum,
//                 amount,
//                 PaymentMethod,
//                 paymentOption,
//                 time_paid,
//                 chargeId,
//                 ref_number1,
//               });
//               console.log("AddHisPayment response:", res?.data);
//               SwalSuccess("อัพเดทประวัติการชำระเรียบร้อย");
//               setTimeout(() => {
//                 window.location.replace("/all-orders");
//               }, 1500);
//             }
//           } else if (result?.data?.card) {
//             console.log("card", result?.data?.card);
//             const PaymentMethod = "Credit Card";
//             const res = await authAxiosClient?.post("/api/AddHisPayment", {
//               orderId,
//               orderDetail,
//               totalSum,
//               amount,
//               PaymentMethod,
//               paymentOption,
//               time_paid,
//               chargeId,
//               ref_number1,
//             });
//             console.log("AddHisPayment response:", res?.data);
//             SwalSuccess("อัพเดทประวัติการชำระเรียบร้อย");
//             setTimeout(() => {
//               window.location.replace("/all-orders");
//             }, 1500);
//           } else {
//             console.log("Other payment method not recognized");
//           }
//         } else if (result?.data.failure_code) {
//           console.log("Charge details:", result?.data.failure_code);

//           Swal.fire({
//             icon: "warning",
//             text: "ตรวจสอบการจ่ายเป็น Pendding ใน Payment Gateway คุณต้องการยกเลิกคำสั่งซื้อเลยหรือไม่",
//             showCancelButton: true,
//             confirmButtonText: "ตกลง",
//             cancelButtonText: "ปิด",
//           }).then(async (result) => {
//             if (result.isConfirmed) {
//               const orderId = orderDetail.at(0).Order_id;
//               const Remark = `ตรวจสอบการจ่ายเป็น Pendding ใน Payment Gateway`;
//               try {
//                 const res = await authAxiosClient?.post("/api/claerStatusR", {
//                   orderId,
//               chargeId,
//               Remark,
//               time,
//               name,
//                 });
//                 console.log("claerStatusR response:", res?.data);
//                 SwalSuccess("อัพเดทประวัติการชำระเรียบร้อย");
//                 setTimeout(() => {
//                   window.location.replace("/all-orders");
//                 }, 1500);
//               } catch (error) {
//                 console.error("Error in claerStatusR:", error);
//                 Swal.fire({
//                   icon: "error",
//                   text: "เกิดข้อผิดพลาดในการยกเลิกสถานะ",
//                 });
//               }
//             } else {
//               console.log("User closed");
//             }
//           });
//         } else {
//           console.log("Waiting for payment...");
//           Swal.fire({
//             icon: "warning",
//             text: "ตรวจสอบการจ่ายเป็น Pendding ใน Payment Gateway คุณต้องการยกเลิกคำสั่งซื้อเลยหรือไม่",
//             showCancelButton: true,
//             confirmButtonText: "ตกลง",
//             cancelButtonText: "ปิด",
//           }).then(async (result) => {
//             if (result.isConfirmed) {
//               const orderId = orderDetail.at(0).Order_id;
//               const Remark = `ตรวจสอบการจ่ายเป็น Pendding ใน Payment Gateway`;
//               try {
//                 const res = await authAxiosClient?.post("/api/claerStatusR", {
//                   orderId,
//                   chargeId,
//                   Remark,
//                   time,
//                   name,
//                 });
//                 console.log("claerStatusR response:", res?.data);
//                 SwalSuccess("อัพเดทประวัติการชำระเรียบร้อย");
//                 setTimeout(() => {
//                   window.location.replace("/all-orders");
//                 }, 1500);
//               } catch (error) {
//                 console.error("Error in claerStatusR:", error);
//                 Swal.fire({
//                   icon: "error",
//                   text: "เกิดข้อผิดพลาดในการยกเลิกสถานะ",
//                 });
//               }
//             } else {
//               console.log("User closed");
//             }
//           });
//         }
//       } else {
//         console.error("Error retrieving charge details:", response);
//         Swal.fire({
//           icon: "error",
//           text: "ไม่สามารถดึงข้อมูลการชำระเงินได้",
//         });
//       }
//     } catch (error) {
//       console.error(
//         "Failed to retrieve charge details:",
//         error.message || error
//       );
//       Swal.fire({
//         icon: "error",
//         text: "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน",
//       });
//     }
//   };

// ตั้งค่า Cron Job ให้รันทุก 15 นาที
cron.schedule("*/15 * * * *", async () => {
  console.log("Starting Cron Job at", new Date().toLocaleTimeString());

  try {
    const chargeData = await getChargeIdsFromDB();

    if (!chargeData || chargeData.length === 0) {
      console.log("No charge IDs found for today.");
      return;
    }

    console.log(`Found ${chargeData.length} charge data:`, chargeData);

    // เรียกใช้ PaymentGateway สำหรับแต่ละ chargeData
    for (const { orderId, chargeId } of chargeData) {
      await PaymentGateway(chargeId, orderId);
    }
  } catch (error) {
    console.error("Error in Cron Job:", error.message || error);
  }
});
