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
    <div style={{ padding: "1.5rem 0", fontFamily: "var(--font-sans)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {[
          { label: "Total devices", value: total, color: undefined },
          { label: "Reachable", value: reach, color: "#1D9E75" },
          { label: "Unreachable", value: unreach, color: "#E24B4A" },
          { label: "Sites", value: sites, color: undefined },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: "var(--border-radius-md)",
              padding: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                marginBottom: "6px",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: m.color ?? "var(--color-text-primary)",
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            WAN edge health
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                position: "relative",
                width: 160,
                height: 160,
                flexShrink: 0,
              }}
            >
              <canvas
                ref={donutRef}
                width={160}
                height={160}
                role="img"
                aria-label="Donut chart showing WAN edge health"
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {total}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-secondary)",
                    marginTop: "3px",
                  }}
                >
                  WAN Edge(s)
                </div>
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                { color: "#1D9E75", label: "Reachable", count: reach },
                { color: "#E24B4A", label: "Unreachable", count: unreach },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: l.color,
                      flexShrink: 0,
                    }}
                  />
                  {l.label}
                  <span
                    style={{
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginLeft: "auto",
                      minWidth: 32,
                      textAlign: "right",
                    }}
                  >
                    {l.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            Site BFD connectivity ({sites})
          </div>
          {[
            {
              label: "Reachable",
              count: reach,
              bg: "#EAF3DE",
              color: "#3B6D11",
            },
            {
              label: "Partial",
              count: partial,
              bg: "#FAEEDA",
              color: "#854F0B",
            },
            {
              label: "Unreachable",
              count: unreach,
              bg: "#FCEBEB",
              color: "#A32D2D",
            },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "var(--color-text-primary)",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: row.bg,
                    color: row.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  {row.label[0]}
                </span>
                {row.label}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {row.count}
              </div>
            </div>
          ))}
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-secondary)",
                marginBottom: "4px",
              }}
            >
              Reachability rate
            </div>
            <div
              style={{
                background: "var(--color-background-secondary)",
                borderRadius: "4px",
                height: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "4px",
                  background: "#1D9E75",
                  width: `${pct}%`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                marginTop: "4px",
              }}
            >
              {pct}%
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
            }}
          >
            Device list
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["all", "reachable", "unreachable"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: "0.5px solid var(--color-border-tertiary)",
                  background:
                    filter === f
                      ? "var(--color-background-secondary)"
                      : "transparent",
                  color:
                    filter === f
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                  fontWeight: filter === f ? 500 : 400,
                  cursor: "pointer",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              tableLayout: "fixed",
            }}
          >
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
                {[
                  "Hostname",
                  "System IP",
                  "Site ID",
                  "Type",
                  "ge0/1 IP",
                  "ge0/2 IP",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    {h}
                  </th>
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
                      padding: "2rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    No devices found
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr key={idx}>
                    {[
                      d.hostname,
                      d.systemIp,
                      d.siteId,
                      d.type,
                      d.ge01 ?? "—",
                      d.ge02 ?? "—",
                    ].map((val, i) => (
                      <td
                        key={i}
                        title={String(val)}
                        style={{
                          padding: "9px 10px",
                          borderBottom:
                            "0.5px solid var(--color-border-tertiary)",
                          color:
                            val === "—"
                              ? "var(--color-text-secondary)"
                              : "var(--color-text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {val}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "9px 10px",
                        borderBottom:
                          "0.5px solid var(--color-border-tertiary)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 500,
                          background:
                            d.reachable === "reachable" ? "#EAF3DE" : "#FCEBEB",
                          color:
                            d.reachable === "reachable" ? "#3B6D11" : "#A32D2D",
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background:
                              d.reachable === "reachable"
                                ? "#639922"
                                : "#E24B4A",
                            display: "inline-block",
                          }}
                        />
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

        // console.log("Device Types:", deviceTypes);

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

            // console.log(
            //   `Device ${i} (${deviceIds[i]})`,
            //   "type:",
            //   deviceTypes[i],
            //   "ge0/1:",
            //   ge01?.["ip-address"] ?? null,
            //   "ge0/2:",
            //   ge02?.["ip-address"] ?? null,
            // );
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              color: "var(--color-text-secondary)",
              fontSize: "14px",
            }}
          >
            Waiting for connection...
          </div>
        )}
      </main>
    </div>
  );
}
