import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(request) {
  try {
    const body = await request.json();
    const { hostname, ip, username, password } = body;

    if (!hostname || !ip || !username || !password) {
      return NextResponse.json(
        { error: "hostname, ip, username, and password are required" },
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

    const deviceListResponse = await axios.get(
      `https://${ip}/dataservice/system/device/vedges`,
      {
        headers: { Cookie: sessionCookie, "X-XSRF-TOKEN": xsrfToken },
        httpsAgent,
      }
    );

    const allDevices = deviceListResponse.data?.data ?? [];
    const targetDevice = allDevices.find(
      (d) => d["host-name"] === hostname || d.hostName === hostname
    );

    if (!targetDevice) {
      return NextResponse.json(
        { error: "Device not found in vManage" },
        { status: 404 }
      );
    }

    const uuid = targetDevice.uuid || targetDevice.deviceId;

    if (!uuid) {
      return NextResponse.json(
        { error: "Unable to resolve device UUID" },
        { status: 422 }
      );
    }

    const invalidateResponse = await axios.put(
      `https://${ip}/dataservice/certificate/vedge/list?action=invalidate`,
      {
        action: "invalidate",
        devices: [
          {
            deviceId: uuid,
            deviceIP: targetDevice["system-ip"],
            validity: "invalid",
          },
        ],
      },
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
        message: `Device ${hostname} invalidated successfully`,
        vmanageResponse: invalidateResponse.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("invalidatedevice error:", error?.response?.data ?? error);
    return NextResponse.json(
      {
        error: "Failed to invalidate device",
        detail: error?.response?.data ?? error?.message,
      },
      { status: 500 }
    );
  }
}