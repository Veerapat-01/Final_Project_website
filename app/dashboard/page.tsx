"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { VManageConnectionModal } from "@/components/dashboard/vmanage-connection-modal";
import { cn } from "@/lib/utils";
import axios from "axios";
import Script from "next/script";

interface Device {
  hostname: string;
  systemIp: string;
  siteId: string;
  type: string;
  ge01: string | null;
  ge02: string | null;
  reachable: string;
  status: string;
}

function DeviceDashboard({ devices }: { devices: Device[] }) {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [filter, setFilter] = useState<"all" | "reachable" | "unreachable">(
    "all",
  );

  const total = devices.length;
  const reach = devices.filter((d) => d.reachable === "reachable").length;
  const unreach = total - reach;
  const sites = new Set(devices.map((d) => d.siteId)).size;
  const pct = total > 0 ? Math.round((reach / total) * 100) : 0;
  const partial = devices.filter(
    (d) => d.status === "degraded" && d.reachable === "reachable",
  ).length;

  const filtered =
    filter === "all" ? devices : devices.filter((d) => d.reachable === filter);

  useEffect(() => {
    if (!donutRef.current) return;
    const Chart = (window as any).Chart;
    if (!Chart) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    chartInstanceRef.current = new Chart(donutRef.current.getContext("2d"), {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [reach || 0, unreach || 1],
            backgroundColor: ["#1D9E75", "#E24B4A"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: false,
        cutout: "68%",
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
      },
    });
  }, [reach, unreach]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .db-root {
          padding: 2rem 0;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        /* ── METRIC CARDS ── */
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .metric-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          padding: 1.35rem 1.25rem 1.2rem;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.10);
          box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.11), 0 1px 4px rgba(0,0,0,0.06);
        }
        .metric-card .accent-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          border-radius: 16px 16px 0 0;
        }
        .metric-card .m-label {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 10px;
        }
        .metric-card .m-value {
          font-family: 'Syne', sans-serif;
          font-size: 2.4rem;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .metric-card .m-sub {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 6px;
          opacity: 0.7;
        }
        .metric-card .m-icon {
          position: absolute;
          bottom: 14px;
          right: 16px;
          font-size: 28px;
          opacity: 0.06;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          line-height: 1;
        }

        /* ── PANEL CARDS ── */
        .panel {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 18px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
        }
        .panel-title {
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .panel-title::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: var(--color-border-tertiary);
        }

        /* ── DARK MODE OVERRIDES ── */
        @media (prefers-color-scheme: dark) {
          .metric-card, .panel {
            background: rgba(255,255,255,0.06) !important;
            border-color: rgba(255,255,255,0.12) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2) !important;
          }
          .metric-card:hover, .panel:hover {
            box-shadow: 0 6px 20px rgba(0,0,0,0.4) !important;
          }
        }

        /* ── WAN EDGE HEALTH ── */
        .wan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--color-text-secondary);
          padding: 10px 14px;
          border-radius: 10px;
          background: var(--color-background-secondary);
          transition: background 0.15s;
        }
        .legend-item:hover { background: var(--color-background-secondary); }
        .legend-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px;
        }
        .legend-dot.green { background: #1D9E75; box-shadow: 0 0 0 3px rgba(29,158,117,0.15); }
        .legend-dot.red { background: #E24B4A; box-shadow: 0 0 0 3px rgba(226,75,74,0.15); }
        .legend-count {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-left: auto;
        }

        /* ── BFD ROW ── */
        .bfd-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }
        .bfd-row:last-of-type { border-bottom: none; }
        .bfd-pill {
          width: 26px; height: 26px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          flex-shrink: 0;
        }
        .bfd-label { font-size: 14px; color: var(--color-text-primary); }
        .bfd-count {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 700;
          color: var(--color-text-primary);
        }

        /* ── PROGRESS BAR ── */
        .pbar-wrap {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 0.5px solid var(--color-border-tertiary);
        }
        .pbar-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .pbar-label { font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; color: var(--color-text-secondary); }
        .pbar-pct { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: var(--color-text-primary); }
        .pbar-track {
          background: var(--color-background-secondary);
          border-radius: 100px;
          height: 8px;
          overflow: hidden;
        }
        .pbar-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #1D9E75 0%, #5DCAA5 100%);
          transition: width 1s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }
        .pbar-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 20px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25));
          border-radius: inherit;
        }

        /* ── DEVICE TABLE ── */
        .device-table-panel { }
        .filter-bar { display: flex; gap: 6px; }
        .filter-btn {
          font-size: 12px;
          padding: 5px 14px;
          border-radius: 100px;
          border: 0.5px solid var(--color-border-tertiary);
          background: transparent;
          color: var(--color-text-secondary);
          font-weight: 400;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
          letter-spacing: 0.01em;
        }
        .filter-btn.active {
          background: var(--color-text-primary);
          color: var(--color-background-primary);
          border-color: var(--color-text-primary);
          font-weight: 500;
        }
        .filter-btn:not(.active):hover {
          background: var(--color-background-secondary);
          color: var(--color-text-primary);
        }
        .tbl { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
        .tbl th {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--color-text-secondary);
          text-align: left;
          padding: 10px 12px 10px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }
        .tbl td {
          padding: 11px 12px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background 0.1s;
        }
        .tbl tr:hover td { background: var(--color-background-secondary); }
        .tbl tr:last-child td { border-bottom: none; }
        .tbl td.muted { color: var(--color-text-secondary); font-style: italic; }
        .tbl td.mono { font-family: 'DM Mono', monospace; font-size: 12px; }

        /* status badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }
        .status-badge.up { background: #EAF3DE; color: #3B6D11; }
        .status-badge.down { background: #FCEBEB; color: #A32D2D; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.up { background: #1D9E75; }
        .status-dot.down { background: #E24B4A; }

        /* ── DONUT WRAPPER ── */
        .donut-wrap {
          position: relative; width: 160px; height: 160px; flex-shrink: 0;
        }
        .donut-center {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center; pointer-events: none;
        }
        .donut-num {
          font-family: 'Syne', sans-serif;
          font-size: 30px; font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
        }
        .donut-sub {
          font-size: 10px; color: var(--color-text-secondary);
          margin-top: 3px; letter-spacing: 0.04em; text-transform: uppercase;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          display: flex; align-items: center; justify-content: center;
          height: 60vh; flex-direction: column; gap: 12px;
          color: var(--color-text-secondary); font-size: 14px;
          font-family: 'DM Sans', sans-serif;
        }
        .empty-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: var(--color-background-secondary);
          border: 0.5px solid var(--color-border-tertiary);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 4px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeUp 0.4s ease both; }
        .anim-1 { animation: fadeUp 0.4s 0.07s ease both; }
        .anim-2 { animation: fadeUp 0.4s 0.14s ease both; }
        .anim-3 { animation: fadeUp 0.4s 0.21s ease both; }
        .anim-panel-1 { animation: fadeUp 0.45s 0.1s ease both; }
        .anim-panel-2 { animation: fadeUp 0.45s 0.18s ease both; }
        .anim-table { animation: fadeUp 0.45s 0.26s ease both; }
      `}</style>

      <div className="db-root">

        {/* ── METRIC CARDS ── */}
        <div className="metric-grid">
          {[
            { label: "Total Devices", value: total, color: "var(--color-text-primary)", bar: "var(--color-border-tertiary)", icon: "DEV", sub: "monitored", cls: "anim-0" },
            { label: "Reachable", value: reach, color: "#1D9E75", bar: "linear-gradient(90deg,#1D9E75,#5DCAA5)", icon: "UP", sub: "online now", cls: "anim-1" },
            { label: "Unreachable", value: unreach, color: "#E24B4A", bar: "linear-gradient(90deg,#E24B4A,#F09595)", icon: "DN", sub: "offline", cls: "anim-2" },
            { label: "Sites", value: sites, color: "var(--color-text-primary)", bar: "linear-gradient(90deg,#7F77DD,#AFA9EC)", icon: "LOC", sub: "locations", cls: "anim-3" },
          ].map((m) => (
            <div key={m.label} className={`metric-card ${m.cls}`}>
              <div className="accent-bar" style={{ background: m.bar }} />
              <div className="m-label">{m.label}</div>
              <div className="m-value" style={{ color: m.color }}>{m.value}</div>
              <div className="m-sub">{m.sub}</div>
              <div className="m-icon">{m.icon}</div>
            </div>
          ))}
        </div>

        {/* ── WAN HEALTH + BFD ── */}
        <div className="wan-grid">
          {/* WAN Edge Health */}
          <div className="panel anim-panel-1">
            <div className="panel-title">WAN Edge Health</div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div className="donut-wrap">
                <canvas
                  ref={donutRef}
                  width={160}
                  height={160}
                  role="img"
                  aria-label="Donut chart showing WAN edge health"
                />
                <div className="donut-center">
                  <div className="donut-num">{total}</div>
                  <div className="donut-sub">WAN Edges</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                {[
                  { color: "green", label: "Reachable", count: reach },
                  { color: "red", label: "Unreachable", count: unreach },
                ].map((l) => (
                  <div key={l.label} className="legend-item">
                    <span className={`legend-dot ${l.color}`} />
                    <span>{l.label}</span>
                    <span className="legend-count">{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BFD Connectivity */}
          <div className="panel anim-panel-2">
            <div className="panel-title">Site BFD Connectivity ({sites})</div>
            {[
              { label: "Reachable", count: reach, bg: "#EAF3DE", color: "#3B6D11", letter: "R" },
              { label: "Partial", count: partial, bg: "#FAEEDA", color: "#854F0B", letter: "P" },
              { label: "Unreachable", count: unreach, bg: "#FCEBEB", color: "#A32D2D", letter: "U" },
            ].map((row) => (
              <div key={row.label} className="bfd-row">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    className="bfd-pill"
                    style={{ background: row.bg, color: row.color }}
                  >
                    {row.letter}
                  </span>
                  <span className="bfd-label">{row.label}</span>
                </div>
                <span className="bfd-count">{row.count}</span>
              </div>
            ))}
            <div className="pbar-wrap">
              <div className="pbar-header">
                <span className="pbar-label">Reachability Rate</span>
                <span className="pbar-pct">{pct}%</span>
              </div>
              <div className="pbar-track">
                <div className="pbar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── DEVICE TABLE ── */}
        <div className="panel device-table-panel anim-table">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div className="panel-title" style={{ margin: 0, flex: 1 }}>Device List</div>
            <div className="filter-bar">
              {(["all", "reachable", "unreachable"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-btn${filter === f ? " active" : ""}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  {["Hostname", "System IP", "Site ID", "Type", "ge0/1 IP", "ge0/2 IP", "Status"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--color-text-secondary)",
                        fontStyle: "italic",
                      }}
                    >
                      No devices found
                    </td>
                  </tr>
                ) : (
                  filtered.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{d.hostname}</td>
                      <td className="mono">{d.systemIp}</td>
                      <td>{d.siteId}</td>
                      <td style={{ textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.04em", fontWeight: 600 }}>{d.type}</td>
                      <td className={cn("mono", !d.ge01 && "muted")}>{d.ge01 ?? "—"}</td>
                      <td className={cn("mono", !d.ge02 && "muted")}>{d.ge02 ?? "—"}</td>
                      <td>
                        <span className={`status-badge ${d.reachable === "reachable" ? "up" : "down"}`}>
                          <span className={`status-dot ${d.reachable === "reachable" ? "up" : "down"}`} />
                          {d.reachable === "reachable" ? "Up" : "Down"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async (credentials: {
    ip: string;
    username: string;
    password: string;
  }) => {
    try {
      const authenResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/POST/authenVmanage`,
        {
          ip: credentials.ip,
          username: credentials.username,
          password: credentials.password,
        },
      );

      const deviceResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/POST/deviceVmanage`,
        {
          ip: credentials.ip,
          cookie: authenResponse.data.cookie,
        },
      );

      if (deviceResponse.status === 200) {
        setShowModal(false);
        setIsConnected(true);

        const data = deviceResponse.data.data.data;

        const filteredData = data.filter(
          (device: { "site-id": string }) =>
            !["1101", "2101"].includes(device["site-id"]),
        );

        const deviceIds = filteredData.map(
          (device: { deviceId: any }) => device.deviceId,
        );
        const systemip = filteredData.map(
          (device: { ["system-ip"]: string }) => device["system-ip"],
        );
        const hostnames = filteredData.map(
          (device: { ["host-name"]: string }) => device["host-name"],
        );
        const siteIds = filteredData.map(
          (device: { ["site-id"]: string }) => device["site-id"],
        );
        const reachability = filteredData.map(
          (device: { reachability: any }) => device.reachability,
        );
        const status = filteredData.map(
          (device: { status: any }) => device.status,
        );
        const uuid = filteredData.map((device: { uuid: any }) => device.uuid);
        const deviceTypes = filteredData.map(
          (device: { "device-type": string }) => device["device-type"],
        );

        const responseInterfaces = await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/POST/getInterfaces`,
          {
            ip: credentials.ip,
            deviceId: deviceIds[100],
            cookie: authenResponse.data.cookie,
          },
        );

        for (let i = 0; i < deviceIds.length; i++) {
          let ge01Ip: string | null = null;
          let ge02Ip: string | null = null;

          try {
            const responseInterfaces = await axios.post(
              `${process.env.NEXT_PUBLIC_URL}/api/POST/getInterfaces`,
              {
                ip: credentials.ip,
                deviceId: deviceIds[i],
                cookie: authenResponse.data.cookie,
              },
            );

            const interfaces = responseInterfaces.data.data.data;

            const isEthDevice = ["vsmart", "vbond", "vmanage"].includes(
              deviceTypes[i]?.toLowerCase(),
            );

            const ge01 =
              interfaces.find(
                (int: any) =>
                  int["af-type"] === "ipv4" &&
                  int.ifname === (isEthDevice ? "eth1" : "ge0/1"),
              ) ?? null;

            const ge02 =
              interfaces.find(
                (int: any) =>
                  int["af-type"] === "ipv4" &&
                  int.ifname === (isEthDevice ? "eth2" : "ge0/2"),
              ) ?? null;

            ge01Ip = ge01?.["ip-address"] ?? null;
            ge02Ip = ge02?.["ip-address"] ?? null;
          } catch (error) {
            console.error(
              `Device ${i} (${deviceIds[i]}) getInterfaces failed`,
              error,
            );
          }

          try {
            const responseCheck = await axios.post(
              `${process.env.NEXT_PUBLIC_URL}/api/POST/getdevicebyhostname`,
              { hostname: hostnames[i] },
            );

            if (responseCheck.data.length === 0) {
              const responsesave = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/POST/pushdeviceinfo`,
                {
                  system_ip: systemip[i],
                  hostname: hostnames[i],
                  siteid: siteIds[i],
                  ipad1: ge01Ip,
                  ipad2: ge02Ip,
                  reachable: reachability[i],
                },
              );
              if (responsesave.status === 200) {
                console.log("Device info saved successfully");
              } else {
                console.error("Failed to save device info");
              }
            } else {
              console.log(`Device ${hostnames[i]} already exists, skipping`);
            }
          } catch (error) {
            console.error(`Device ${i} (${deviceIds[i]}) save failed`, error);
          }

          setDevices((prev) => [
            ...prev,
            {
              hostname: hostnames[i],
              systemIp: systemip[i],
              siteId: siteIds[i],
              type: deviceTypes[i],
              ge01: ge01Ip,
              ge02: ge02Ip,
              reachable: reachability[i],
              status: status[i],
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error occurred while connecting to vManage:", error);
      setShowModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"
        onLoad={() => setChartReady(true)}
      />

      {showModal && <VManageConnectionModal onConnect={handleConnect} />}

      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      <main
        className={cn(
          "flex-1 p-4 md:p-5 lg:p-6 transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        {isConnected && chartReady ? (
          <DeviceDashboard devices={devices} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <span>Waiting for connection…</span>
          </div>
        )}
      </main>
    </div>
  );
}