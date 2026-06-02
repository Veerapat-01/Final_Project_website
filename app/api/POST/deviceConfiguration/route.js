import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { ip, uuid, cookie } = await request.json();

    const response = await axios.get(
      `https://${ip}/dataservice/troubleshooting/devicebringup?uuid=${uuid}`,
      {
        headers: {
          Accept: "application/json",
          Cookie: Array.isArray(cookie) ? cookie.join("; ") : cookie,
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      },
    );

    return Response.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
