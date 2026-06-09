import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(request) {
  try {
    const body = await request.json();
    const { chassisNumber, ip, username, password } = body;

    if (!chassisNumber || !ip || !username || !password) {
      return NextResponse.json(
        { error: "chassisNumber, ip, username, and password are required" },
        { status: 400 },
      );
    }

    const authResponse = await axios.post(
      `https://${ip}/j_security_check`,
      `j_username=${username}&j_password=${password}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
        maxRedirects: 0,
        validateStatus: (s) => s < 400,
      },
    );

    const sessionCookie = authResponse.headers["set-cookie"]
      ?.map((c) => c.split(";")[0])
      .join("; ");

    const tokenResponse = await axios.get(
      `https://${ip}/dataservice/client/token`,
      { headers: { Cookie: sessionCookie }, httpsAgent },
    );

    const xsrfToken = tokenResponse.data;

    const invalidateResponse = await axios.delete(
      `https://${ip}/dataservice/certificate/${chassisNumber}`,
      {
        headers: {
          Cookie: sessionCookie,
          "X-XSRF-TOKEN": xsrfToken,
          "Content-Type": "application/json",
        },
        httpsAgent,
      },
    );

    return NextResponse.json(
      {
        message: `Device ${chassisNumber} invalidated successfully`,
        deviceId: chassisNumber,
        vmanageResponse: invalidateResponse.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("invalidatedevice error:", error?.response?.data ?? error);
    return NextResponse.json(
      {
        error: "Failed to invalidate device",
        detail: error?.response?.data ?? error?.message,
      },
      { status: 500 },
    );
  }
}
