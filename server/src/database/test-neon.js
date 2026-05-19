import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    console.log("Success! Server time:", res.rows[0]);
    await client.release();
    await pool.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
