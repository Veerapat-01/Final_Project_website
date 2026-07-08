import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(request) {
  try {
    const body = await request.json();
    const { uuid, ip, username, password } = body;

    const missing = [];
    if (!uuid) missing.push("uuid");
    if (!ip) missing.push("ip");
    if (!username) missing.push("username");
    if (!password) missing.push("password");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    // 1. Authenticate
    const authResponse = await axios.post(
      `https://${ip}/j_security_check`,
      `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
        validateStatus: () => true,
      },
    );

    const sessionCookie = authResponse.headers["set-cookie"]
      ?.map((c) => c.split(";")[0])
      .join("; ");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    // 2. Get Token
    const tokenResponse = await axios.get(
      `https://${ip}/dataservice/client/token`,
      {
        headers: { Cookie: sessionCookie },
        httpsAgent,
        validateStatus: () => true,
      },
    );

    if (tokenResponse.status !== 200) {
      return NextResponse.json(
        { error: "Failed to get XSRF token" },
        { status: 500 },
      );
    }

    const xsrfToken = tokenResponse.data;

    // 3. Delete WAN Edge Device
    // For Cisco vManage, the endpoint to delete a device by uuid is DELETE /dataservice/system/device/{uuid}
    const deleteResponse = await axios.delete(
      `https://${ip}/dataservice/system/device/${uuid}`,
      {
        headers: {
          Cookie: sessionCookie,
          "X-XSRF-TOKEN": xsrfToken,
          Accept: "application/json",
        },
        httpsAgent,
        validateStatus: () => true,
      },
    );

    console.log("[deletevedge] delete status:", deleteResponse.status);
    console.log("[deletevedge] delete response:", JSON.stringify(deleteResponse.data));

    if (deleteResponse.status === 200 || deleteResponse.status === 202 || deleteResponse.status === 204) {
      return NextResponse.json(
        {
          success: true,
          message: "Device deleted successfully",
          data: deleteResponse.data,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Device deletion failed",
        vmanageStatus: deleteResponse.status,
        data: deleteResponse.data,
      },
      { status: 400 },
    );
  } catch (error) {
    console.log("[deletevedge] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
