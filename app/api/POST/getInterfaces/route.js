import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { ip, deviceId, cookie } = await request.json();

    const response = await axios.get(
      `https://${ip}/dataservice/device/interface?deviceId=${deviceId}`,
      {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          Cookie: cookie,
        },
      },
    );

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error.response?.data || error.message || "Failed to get interfaces",
      },
      {
        status: error.response?.status || 500,
      },
    );
  }
}
