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

    const vedgeListResponse = await axios.get(
      `https://${ip}/dataservice/certificate/vedge/list`,
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

    if (vedgeListResponse.status !== 200) {
      return NextResponse.json(
        { error: "Failed to retrieve vedge list" },
        { status: 500 },
      );
    }

    const vedgeList = vedgeListResponse.data?.data ?? [];

    const matched = vedgeList.find(
      (d) =>
        d.chasisNumber === uuid ||
        d.uuid === uuid ||
        d.serialNumber === uuid,
    );

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          error: `Device not found in vedge list for chassis: ${uuid}`,
        },
        { status: 404 },
      );
    }

    console.log("[invalidatedevice] found device:", matched.chasisNumber, "serial:", matched.serialNumber);

    const savePayload = [
      {
        chasisNumber: matched.chasisNumber,
        serialNumber: matched.serialNumber,
        validity: "invalid",
      },
    ];

    console.log("[invalidatedevice] POST /certificate/save/vedge/list payload:", JSON.stringify(savePayload));

    const saveResponse = await axios.post(
      `https://${ip}/dataservice/certificate/save/vedge/list`,
      savePayload,
      {
        headers: {
          Cookie: sessionCookie,
          "X-XSRF-TOKEN": xsrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        httpsAgent,
        validateStatus: () => true,
      },
    );

    console.log("[invalidatedevice] save status:", saveResponse.status);
    console.log("[invalidatedevice] save response:", JSON.stringify(saveResponse.data));

    if (saveResponse.status === 200 || saveResponse.status === 202) {
      return NextResponse.json(
        {
          success: true,
          message: "Device invalidated successfully",
          data: saveResponse.data,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Device invalidation failed",
        vmanageStatus: saveResponse.status,
        data: saveResponse.data,
      },
      { status: 400 },
    );
  } catch (error) {
    console.log("[invalidatedevice] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
