import pool from "../config/db.config.js";
import sql from "mssql";

export const claerStatusR = async ({ orderId, chargeId, Remark, time, name }) => {
  console.log("เข้าclaerStatusR")
  let transaction;
  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // อัปเดตสถานะ Order_H
    await transaction
      .request()
      .input("orderId", sql.Int, orderId)
      .input("name", sql.NVarChar, name)
      .input("remark", sql.NVarChar, Remark)
      .input("currentDate", sql.DateTime, time)
      .query(`
        UPDATE Order_H 
        SET Order_Status = 13,
            Cancel_By = @name,
            Cancel_Date = @currentDate,
            Remark_1 = @remark
        WHERE Order_Id = @orderId AND Order_Status = 4;
      `);

    // ลบรายการ Ticket_List
    await transaction
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`
        DELETE FROM Ticket_List
        WHERE order_id = @orderId AND ticket_Reserve = 'R';
      `);

    await transaction.commit();
    console.log("เสร็จclaerStatusR")
    return { success: true, message: "Order canceled successfully." };
  } catch (error) {
    if (transaction) await transaction.rollback();
    return { success: false, error: error.message };
  }
};
