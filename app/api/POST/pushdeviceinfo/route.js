import { pool } from "@/db";

export async function POST(request) {
  try {
    const {
      hostname,
      systemip,
      siteid,
      ipad1,
      ipad2,
      deviceType,
      reachable,
      serial,
    } = await request.json();

    const t = (deviceType ?? "").toLowerCase();
    let g_01 = null;
    let g_02 = null;
    let eth_0 = null;

    if (t === "vmanage" || t === "vsmart") {
      eth_0 = ipad1;
    } else {
      g_01 = ipad1;
      g_02 = ipad2;
    }

    await pool.execute(
      `INSERT INTO device_lists (hostname, systemip, siteid, g_01, g_02, eth_0, reachable, roles, serial)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         systemip = VALUES(systemip),
         siteid = VALUES(siteid),
         g_01 = VALUES(g_01),
         g_02 = VALUES(g_02),
         eth_0 = VALUES(eth_0),
         reachable = VALUES(reachable),
         roles = VALUES(roles),
         serial = VALUES(serial)`,
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
