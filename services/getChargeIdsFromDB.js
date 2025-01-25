import pool from "../config/db.config.js";
import sql from "mssql";


export const getChargeIdsFromDB = async () => {
  try {
    const connection = await pool.connect();

    const result = await connection.request()
      .query(`
        SELECT Order_id, Charge_Id
        FROM Order_H
        WHERE CAST(Created_Date AS DATE) = CAST(GETDATE() AS DATE)
          AND Charge_Id IS NOT NULL
          AND Order_Status = 4 
      `);

    // คืนค่ารายการที่เป็นออบเจ็กต์ { Order_id, Charge_Id }
    return result.recordset.map((row) => ({
      orderId: row.Order_id,
      chargeId: row.Charge_Id,
    }));
  } catch (error) {
    console.error("Error fetching charge IDs:", error.message || error);
    return [];
  }
};


