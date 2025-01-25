import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const sqlConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
};

const pool = new sql.ConnectionPool(sqlConfig);

export async function connectDB() {
  try {
    await pool.connect();
    console.log(`[INFO] : เชื่อมต่อ database สำเร็จ`);
  } catch (err) {
    console.error(`[ERROR] : ล้มเหลวระหว่างเชื่อม database ${err.message}`);
  }
}

connectDB();

export async function disconnectDB() {
  try {
    await pool.close();
    console.log(`[INFO] : ยกเลิกการเชื่อมต่อ database สำเร็จ`);
  } catch (err) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างยกเลิกการเชื่อมต่อ database ${err.message}`
    );
  }
}

export default pool;