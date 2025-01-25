import pool from "../config/db.config.js";
import sql from "mssql";

export const getChargeIdsFromDB = async () => {
  let connection;
  try {

    connection = await pool.connect();

    const result = await connection.request()
      .query(`
        SELECT Order_id, Charge_Id
        FROM Order_H
        WHERE Created_Date >= DATEADD(MINUTE, -15, GETDATE()) 
          AND CAST(Created_Date AS DATE) = CAST(GETDATE() AS DATE) 
          AND Charge_Id IS NOT NULL
          AND Order_Status = 4
      `);

    // คืนค่ารายการในรูปแบบ { orderId, chargeId }
    return result.recordset.map((row) => ({
      orderId: row.Order_id,
      chargeId: row.Charge_Id,
    }));
  } catch (error) {
    // แสดงข้อผิดพลาดใน console
    console.error("Error fetching charge IDs in getChargeIdsFromDB:", error.message || error);
    return [];
  } finally {
    // ปิดการเชื่อมต่อหากเปิดอยู่
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing the database connection:", closeError.message || closeError);
      }
    }
  }
};
