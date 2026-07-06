import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * POST /api/POST/sendtocontroller
 *
 * Push all vEdge devices to controllers via Cisco SD-WAN Manager API.
 * Ref: https://developer.cisco.com/docs/sdwan/save-vedge-list-send-to-controller/
 *
 * Request body:
 * {
 *   ip:       string  — vManage IP
 *   username: string  — vManage username
 *   password: string  — vManage password
 * }
 *
 * Flow:
 *  1. Authenticate    → POST /j_security_check
 *  2. Get XSRF token  → GET  /dataservice/client/token
 *  3. Get vedge list  → GET  /dataservice/certificate/vedge/list
 *  4. Save            → POST /dataservice/certificate/vedge/list?action=save
 *  5. Push            → POST /dataservice/certificate/vedge/list?action=push
 */
export async function POST(request) {
  try {
    const { ip, username, password } = await request.json();

    // Validate
    const missing = [];
    if (!ip) missing.push("ip");
    if (!username) missing.push("username");
    if (!password) missing.push("password");
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    // ── Step 1: Authenticate ─────────────────────────────────────────────────
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
        { success: false, error: "Authentication failed" },
        { status: 401 },
      );
    }

    // ── Step 2: Get XSRF Token ───────────────────────────────────────────────
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
        { success: false, error: "Failed to get XSRF token" },
        { status: 500 },
      );
    }

    const xsrfToken = tokenResponse.data;

    const headers = {
      Cookie: sessionCookie,
      "X-XSRF-TOKEN": xsrfToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // ── Step 3: Push to controllers ──────────────────────────────────────────
    const pushResponse = await axios.post(
      `https://${ip}/dataservice/certificate/vedge/list?action=push`,
      {},
      { headers, httpsAgent, validateStatus: () => true },
    );

    if (pushResponse.status !== 200 && pushResponse.status !== 202) {
      return NextResponse.json(
        {
          success: false,
          error: "Push to controllers failed",
          vmanageStatus: pushResponse.status,
          detail: pushResponse.data,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Pushed changes to controllers successfully`,
        data: pushResponse.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[sendtocontroller] error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error",
        detail: error?.response?.data ?? error?.message,
      },
      { status: 500 },
    );
  }
}