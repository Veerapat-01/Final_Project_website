import { pool } from "@/db";

export async function POST(request) {
  try {
    const {
      hostname,
      systemip,
      siteid,
      ipad1,
      ipad2,
      eth0,
      deviceType,
      reachable,
      serial,
      validity,
    } = await request.json();

    const t = (deviceType ?? "").toLowerCase();
    let g_01 = null;
    let g_02 = null;
    let eth_0 = eth0 ?? null;

    if (t === "vmanage" || t === "vsmart") {
      if (!eth_0) eth_0 = ipad1;
    } else {
      g_01 = ipad1;
      g_02 = ipad2;
    }

    // Check if device already exists with this hostname and serial
    const [existing] = await pool.execute(
      "SELECT * FROM device_lists WHERE hostname = ? AND serial = ?",
      [hostname, serial]
    );

    if (existing.length > 0) {
      // If it exists, update its details (especially reachability) instead of ignoring
      await pool.execute(
        `UPDATE device_lists SET systemip = ?, siteid = ?, g_01 = ?, g_02 = ?, eth_0 = ?, reachable = ?, roles = ?, validity = ? WHERE hostname = ? AND serial = ?`,
        [systemip, siteid, g_01, g_02, eth_0, reachable, deviceType, validity, hostname, serial]
      );
      return Response.json({ success: true, message: "Device updated" });
    }

    await pool.execute(
      `INSERT INTO device_lists (hostname, systemip, siteid, g_01, g_02, eth_0, reachable, roles, serial, validity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hostname,
        systemip,
        siteid,
        g_01,
        g_02,
        eth_0,
        reachable,
        deviceType,
        serial,
        validity,
      ],
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
