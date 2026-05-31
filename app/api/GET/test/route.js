import { pool } from "@/db";
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    return Response.json(rows);
  } catch (error) {
    console.log(error);
  }
}
