import { pool } from "@/db";

export async function POST(request) {
  try {
    const { name, email, role } = await request.json();

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const fname = nameParts[0];
    const lname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Generate a simple staff_id (e.g. random 7-char string or u+timestamp)
    const staffId = "u" + Date.now().toString().slice(-6);
    
    // Default password for new users
    const defaultPassword = "password123";

    const [result] = await pool.query(
      "INSERT INTO users (staff_id, staff_fname, staff_lname, staff_email, staff_password, staff_dept, roles) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [staffId, fname, lname, email, defaultPassword, role, role]
    );

    return Response.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error("Database query error (adduser):", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
