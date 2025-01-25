import pool from "../config/db.config.js";
import sql from "mssql";

export const AddHisPayment = async ({
  orderId,
  amount,
  PaymentMethod,
  time_paid,
  chargeId,
  ref_number1,
}) => {
  let transaction;
  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // ดึง totalSum จาก Order_D
    const totalSumResult = await transaction
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT SUM(Total_Price) AS totalSum
        FROM Order_D
        WHERE Order_Id = @orderId;
      `);

    if (totalSumResult.recordset.length === 0 || totalSumResult.recordset[0].totalSum == null) {
      throw new Error("Failed to retrieve totalSum for the provided Order_Id.");
    }

    const totalSum = totalSumResult.recordset[0].totalSum;

    // คำนวณเปอร์เซ็นต์ของ amount ต่อ totalSum
    const percentage = (amount / totalSum) * 100;
    let payOptId;

    if (percentage === 25) {
      payOptId = 36;
    } else if (percentage === 50) {
      payOptId = 37;
    } else if (percentage === 75) {
      payOptId = 42;
    } else if (percentage === 100) {
      payOptId = 39;
    } else {
      throw new Error("Invalid percentage of amount to totalSum.");
    }

    // ค้นหา Pay_By_Id
    const payByResult = await transaction
      .request()
      .input("paymentMethod", sql.NVarChar, PaymentMethod)
      .query(`
        SELECT Pay_By_Id 
        FROM Set_Pay_By 
        WHERE Pay_By_Name = @paymentMethod;
      `);

    if (payByResult.recordset.length === 0) {
      throw new Error("Invalid payment method provided.");
    }

    const payById = payByResult.recordset[0].Pay_By_Id;

    // อัปเดตสถานะ Order_H
    await transaction
      .request()
      .input("orderId", sql.Int, orderId)
      .input("chargeId", sql.NVarChar, chargeId)
      .input("ref_number1", sql.NVarChar, ref_number1)
      .query(`
        UPDATE Order_H 
        SET Order_Status = 1,
            Charge_Id = @chargeId,
            Ref_No = @ref_number1
        WHERE Order_Id = @orderId AND Order_Status = 4;
      `);

    // เพิ่มรายการใน his_payment
    await transaction
      .request()
      .input("orderId", sql.Int, orderId)
      .input("netPrice", sql.Numeric(18, 2), totalSum)
      .input("totalPay", sql.Numeric(18, 2), amount)
      .input("payById", sql.Int, payById)
      .input("totalBalance", sql.Numeric(18, 2), totalSum - amount)
      .input("chargeId", sql.VarChar, chargeId)
      .input("ref_number1", sql.VarChar, ref_number1)
      .input("payOptId", sql.Int, payOptId)
      .input("payment_date", sql.DateTime, time_paid)
      .query(`
        INSERT INTO his_payment (
          order_id,
          net_price,
          total_pay,
          pay_by_id,
          total_balance,
          charge_id,
          ref_number1,
          pay_opt_id,
          payment_date
        )
        VALUES (
          @orderId,
          @netPrice,
          @totalPay,
          @payById,
          @totalBalance,
          @chargeId,
          @ref_number1,
          @payOptId,
          @payment_date
        );
      `);

    await transaction.commit();
    return { success: true, message: "Payment and stock updated successfully." };
  } catch (error) {
    if (transaction) await transaction.rollback();
    return { success: false, error: error.message };
  }
};

