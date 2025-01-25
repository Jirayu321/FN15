import pool from "../config/db.config.js";
import sql from "mssql";

export const getChargeIdsFromDB = async () => {
  try {
    const connection = await pool.connect();

    // Query
    const query = `
    SELECT Order_id, Charge_Id, Created_Date
      FROM Order_H
      WHERE Created_Date <= DATEADD(MINUTE, -15, GETDATE()) -- สร้างก่อนมากกว่าเท่ากับ 15 นาที
        AND Charge_Id IS NOT NULL
        AND Order_Status = 4
    `;

    console.log("Generated Query:", query);

    // Execute Query
    const result = await connection.request().query(query);

    console.log("Query Result:", result.recordset);

    // Map Data
    return result.recordset.map((row) => ({
      orderId: row.Order_id,
      chargeId: row.Charge_Id,
    }));
  } catch (error) {
    console.error("Error fetching charge IDs:", error.message || error);
    return [];
  }
};
