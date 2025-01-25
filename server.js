import express from "express";
import dotenv from "dotenv";
import "./cron.js"; // Import Cron Jobs

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Payment Gateway API is running...");
});

const PORT = process.env.PORT || 8178;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});