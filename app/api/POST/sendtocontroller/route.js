import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(request) {
  try {
    const { ip, username, password, serial } = await request.json();

    if (!ip || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const authResponse = await axios.post(
      `https://${ip}/j_security_check`,
      `j_username=${username}&j_password=${password}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
      }
    );

    const sessionCookie = authResponse.headers["set-cookie"]
      ?.map((c) => c.split(";")[0])
      .join("; ");

    const tokenResponse = await axios.get(
      `https://${ip}/dataservice/client/token`,
      { headers: { Cookie: sessionCookie }, httpsAgent }
    );

    const xsrfToken = tokenResponse.data;

    const pushBody = serial ? { devices: [{ deviceId: serial }] } : {};

    const pushResponse = await axios.post(
      `https://${ip}/dataservice/certificate/vedge/list?action=push`,
      pushBody,
      {
        headers: {
          Cookie: sessionCookie,
          "X-XSRF-TOKEN": xsrfToken,
          "Content-Type": "application/json",
        },
        httpsAgent,
      }
    );

    return NextResponse.json(
      {
        message: "Send to controllers successful",
        vmanageResponse: pushResponse.data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to send to controllers",
        detail: error?.response?.data ?? error?.message,
      },
      { status: 500 }
    );
  }
}