"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { VManageConnectionModal } from "@/components/dashboard/vmanage-connection-modal";
import { cn } from "@/lib/utils";
import axios from "axios";
import Script from "next/script";
import styles from "./dashboard.module.css";

interface Device {
  hostname: string;
  serial: string | null;
  systemIp: string;
  siteId: string;
  type: string;
  eth0: string | null;
  ge01: string | null;
  ge02: string | null;
  reachable: string;
  status: string;
}

interface VManageCreds {
  ip: string;
  username: string;
  password: string;
}

const lightTheme = {
  "--theme-bg-base":
    "linear-gradient(145deg, #f0faf5 0%, #eaf6f0 35%, #f4f0ff 70%, #eef5ff 100%)",
  "--theme-bg-primary": "#ffffff",
  "--theme-bg-secondary": "#e6f2eb",
  "--theme-bg-card": "#ffffff",
  "--theme-bg-glass": "rgba(255,255,255,0.88)",
  "--theme-border": "rgba(29,158,117,0.14)",
  "--theme-border-strong": "rgba(29,158,117,0.32)",
  "--theme-text-primary": "#0D1B0A",
  "--theme-text-secondary": "#3A5F38",
  "--theme-text-muted": "#6A8E67",
  "--theme-accent-green": "#1D9E75",
  "--theme-accent-red": "#E24B4A",
  "--theme-accent-light": "#5DCAA5",
  "--theme-accent-glow": "rgba(29,158,117,0.14)",
  "--theme-glow-ring-green": "rgba(29,158,117,0.15)",
  "--theme-glow-ring-red": "rgba(226,75,74,0.15)",
  "--theme-badge-up-bg": "#dcf5ea",
  "--theme-badge-up-color": "#1a6b44",
  "--theme-badge-up-border": "rgba(29,158,117,0.2)",
  "--theme-badge-down-bg": "#FCEBEB",
  "--theme-badge-down-color": "#A32D2D",
  "--theme-badge-down-border": "rgba(226,75,74,0.15)",
  "--theme-grid-line": "rgba(29,158,117,0.07)",
  "--theme-shadow":
    "0 4px 24px rgba(29,158,117,0.1), 0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(29,158,117,0.04)",
  "--theme-shadow-card":
    "0 2px 16px rgba(29,158,117,0.12), 0 1px 4px rgba(0,0,0,0.05)",
  "--theme-filter-active-bg": "#dcf5ea",
  "--theme-filter-active-color": "#1D9E75",
  "--theme-filter-btn-glow": "none",
  "--theme-scan-line": "rgba(29,158,117,0.03)",
  "--theme-pbar-glow": "none",
  "--theme-swap-btn-glow": "none",
  "--theme-swap-btn-hover-glow": "none",
  "--theme-status-dot-glow": "none",
  "--theme-on-accent": "#ffffff",
  "--theme-noise":
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
};

const darkTheme = {
  "--theme-bg-base": "#030C06",
  "--theme-bg-primary": "#040F07",
  "--theme-bg-secondary": "#071409",
  "--theme-bg-card": "#060E08",
  "--theme-bg-glass": "rgba(4,15,7,0.92)",
  "--theme-border": "rgba(29,158,117,0.18)",
  "--theme-border-strong": "rgba(29,158,117,0.4)",
  "--theme-text-primary": "#C8F0D0",
  "--theme-text-secondary": "#4DAA72",
  "--theme-text-muted": "#2A6645",
  "--theme-accent-green": "#00FF88",
  "--theme-accent-red": "#FF4455",
  "--theme-accent-light": "#00FFCC",
  "--theme-accent-glow": "rgba(0,255,136,0.12)",
  "--theme-glow-ring-green": "rgba(0,255,136,0.15)",
  "--theme-glow-ring-red": "rgba(255,68,85,0.15)",
  "--theme-badge-up-bg": "rgba(0,255,136,0.1)",
  "--theme-badge-up-color": "#00FF88",
  "--theme-badge-up-border": "rgba(0,255,136,0.2)",
  "--theme-badge-down-bg": "rgba(255,68,85,0.1)",
  "--theme-badge-down-color": "#FF4455",
  "--theme-badge-down-border": "rgba(255,68,85,0.2)",
  "--theme-grid-line": "rgba(0,255,136,0.04)",
  "--theme-shadow": "0 0 30px rgba(0,255,136,0.06), 0 4px 20px rgba(0,0,0,0.6)",
  "--theme-shadow-card":
    "0 0 20px rgba(0,255,136,0.08), inset 0 1px 0 rgba(0,255,136,0.06)",
  "--theme-filter-active-bg": "rgba(0,255,136,0.12)",
  "--theme-filter-active-color": "#00FF88",
  "--theme-filter-btn-glow": "0 0 10px rgba(0,255,136,0.12)",
  "--theme-scan-line": "rgba(0,255,136,0.03)",
  "--theme-pbar-glow": "0 0 10px rgba(0,255,136,0.4)",
  "--theme-swap-btn-glow": "0 0 10px rgba(0,255,136,0.08)",
  "--theme-swap-btn-hover-glow": "0 0 16px rgba(0,255,136,0.25)",
  "--theme-status-dot-glow": "0 0 5px #00FF88",
  "--theme-on-accent": "#030C06",
  "--theme-noise":
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
};

function resolveIfnames(deviceType: string): { if1: string; if2: string } {
  const t = deviceType?.toLowerCase() ?? "";
  if (t === "vbond") {
    return { if1: "ge0/0", if2: "ge0/1" };
  }
  if (t === "vmanage" || t === "vsmart") {
    return { if1: "eth0", if2: "eth1" };
  }
  return { if1: "ge0/1", if2: "ge0/2" };
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "var(--theme-accent-green)",
          color: "var(--theme-on-accent)",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function matchesSearch(d: Device, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    d.hostname.toLowerCase().includes(lower) ||
    d.systemIp.toLowerCase().includes(lower) ||
    (d.serial?.toLowerCase().includes(lower) ?? false)
  );
}

function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "fixed",
        top: "20px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "40px",
        border: "1px solid var(--theme-border-strong)",
        background: "var(--theme-bg-glass)",
        backdropFilter: "blur(16px)",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "var(--theme-shadow-card)",
        fontFamily: "'DM Mono', monospace",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        color: "var(--theme-text-secondary)",
      }}
    >
      <span style={{ fontSize: "15px", lineHeight: 1 }}>
        {isDark ? "☀️" : "🌙"}
      </span>
      <span style={{ color: "var(--theme-accent-green)" }}>
        {isDark ? "LIGHT" : "DARK"}
      </span>
      <div
        style={{
          width: "32px",
          height: "18px",
          borderRadius: "9px",
          background: isDark
            ? "var(--theme-accent-green)"
            : "var(--theme-bg-secondary)",
          border: "1px solid var(--theme-border-strong)",
          position: "relative",
          transition: "background 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: isDark ? "14px" : "2px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: isDark
              ? "var(--theme-on-accent)"
              : "var(--theme-accent-green)",
            transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: isDark ? "0 0 6px rgba(0,255,136,0.6)" : "none",
          }}
        />
      </div>
    </button>
  );
}

function ConnectionErrorBanner({ onReconnect }: { onReconnect: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        gap: "20px",
      }}
    >
      <div
        className={styles.errBanner}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "2.5rem 3rem",
          borderRadius: "20px",
          background: "var(--theme-bg-card)",
          border: "1px solid var(--theme-accent-red)",
          boxShadow:
            "0 0 0 1px rgba(226,75,74,0.08), 0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "rgba(226,75,74,0.1)",
            border: "1.5px solid var(--theme-accent-red)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "errPulse 2.4s ease-in-out infinite",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8v5M12 16.5v.5"
              stroke="var(--theme-accent-red)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="var(--theme-accent-red)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: "#C8F0D0",
              letterSpacing: "-0.01em",
            }}
          >
            Unable to establish connection
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: "var(--theme-accent-red)",
              textTransform: "uppercase",
            }}
          >
            with vManage
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              color: "var(--theme-text-muted)",
              marginTop: "2px",
            }}
          >
            Check your credentials or network and try again.
          </div>
        </div>
        <button
          className={styles.reconnectBtn}
          onClick={onReconnect}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 22px",
            borderRadius: "100px",
            border: "none",
            background: "var(--theme-accent-red)",
            color: "#ffffff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginTop: "4px",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 8A6 6 0 112 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M14 4v4h-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Reconnect
        </button>
      </div>
    </div>
  );
}

function DeviceDashboard({
  devices,
  isDark,
  vmanageCreds,
}: {
  devices: Device[];
  isDark: boolean;
  vmanageCreds: VManageCreds | null;
}) {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [filter, setFilter] = useState<"all" | "reachable" | "unreachable">(
    "all",
  );
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapQuery, setSwapQuery] = useState("");
  const swapInputRef = useRef<HTMLInputElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showSwapTargetModal, setShowSwapTargetModal] = useState(false);
  const [swapTargetQuery, setSwapTargetQuery] = useState("");
  const swapTargetInputRef = useRef<HTMLInputElement>(null);
  const [targetDevice, setTargetDevice] = useState<Device | null>(null);
  const [showPreconfigModal, setShowPreconfigModal] = useState(false);
  const [preconfigText, setPreconfigText] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [manualSerial, setManualSerial] = useState("");
  const [manualSerialError, setManualSerialError] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

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

  const swapFiltered = devices
    .filter((d) => matchesSearch(d, swapQuery))
    .sort((a, b) => {
      if (a.reachable !== "reachable" && b.reachable === "reachable") return -1;
      if (a.reachable === "reachable" && b.reachable !== "reachable") return 1;
      return 0;
    });

  const swapTargetFiltered = devices
    .filter(
      (d) =>
        d.hostname !== selectedDevice?.hostname &&
        matchesSearch(d, swapTargetQuery),
    )
    .sort((a, b) => {
      if (a.reachable === "reachable" && b.reachable !== "reachable") return -1;
      if (a.reachable !== "reachable" && b.reachable === "reachable") return 1;
      return 0;
    });

  const accentGreen = isDark ? "#00FF88" : "#1D9E75";
  const accentRed = isDark ? "#FF4455" : "#E24B4A";
  const accentLight = isDark ? "#00FFCC" : "#5DCAA5";

  const handleConfirmWithDevice = async (d: Device) => {
    let temp = "";
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/api/POST/getdevicebyhostname`,
      {
        hostname: selectedDevice?.hostname,
      },
    );

    if (response.status === 200) {
      const getdevicedata = response.data[0];

      if (
        getdevicedata.roles === "vmanage" ||
        getdevicedata.roles === "vsmart"
      ) {
        temp += "config\n";
        temp += "system\n";
        temp += `${getdevicedata.hostname}\n`;
        temp += `system-ip ${getdevicedata.systemip}\n`;
        temp += `site-id ${getdevicedata.siteid}\n`;
        temp += `sp-organization-name "BAAC"\n`;
        temp += `organization-name "BAAC"\n`;
        temp += `vbond 172.26.155.17\n`;
        temp += `! \n`;
        temp += `vpn 0 \n`;
        temp += `int eth0\n`;
        temp += ` ip address ${getdevicedata.eth_0} \n`;
        temp += `no shutdown \n`;
      } else {
        temp += "config\n";
        temp += "system\n";
        temp += `host-name ${getdevicedata.hostname}\n`;
        temp += `system-ip ${getdevicedata.systemip}\n`;
        temp += `site-id ${getdevicedata.siteid}\n`;
        temp += `sp-organization-name "BAAC"\n`;
        temp += `organization-name "BAAC"\n`;
        temp += `vbond 172.26.155.17\n`;
        temp += `! \n`;
        temp += `vpn 0\n`;
        temp += `dns 172.26.18.32 primary\n`;
        temp += `dns 8.8.8.8 secondary\n`;
        temp += `int ge0/1 \n`;
        temp += `ip address ${getdevicedata.g_01}\n`;
        temp += `no shutdown\n`;
        temp += `tunnel encap ipsec\n`;
        temp += `color private2\n`;
        temp += `! \n`;
        temp += `int ge0/2 \n`;
        temp += `ip address ${getdevicedata.g_02} \n`;
        temp += `no shutdown\n`;
        temp += `tunnel encap ipsec\n`;
        temp += `color private3\n`;
        temp += `! \n`;
        temp += `! \n`;
        const ip1 = getdevicedata.g_01.split("/")[0];
        const octet1 = ip1.split(".");

        const ip2 = getdevicedata.g_02.split("/")[0];
        const octet2 = ip2.split(".");

        temp += `ip route 0.0.0.0 0.0.0.0 ${
          octet1[0]
        }.${octet1[1]}.${octet1[2]}.${Number(octet1[3]) - 5}\n`;

        temp += `ip route 0.0.0.0 0.0.0.0 ${
          octet2[0]
        }.${octet2[1]}.${octet2[2]}.${Number(octet2[3]) - 5}\n`;
        temp += `! \n`;
        temp += `! \n`;
      }
    }
    setPreconfigText(temp);
    setTargetDevice(d);
    setShowSwapTargetModal(false);
    setShowPreconfigModal(true);
  };

  const handleManualSerialConfirm = async () => {
    const trimmed = manualSerial.trim();
    if (!trimmed) {
      setManualSerialError("Serial number is required.");
      return;
    }
    setManualSerialError("");
    const manualDevice: Device = {
      hostname: "Manual Entry",
      serial: trimmed,
      systemIp: "—",
      siteId: "—",
      type: "—",
      eth0: null,
      ge01: null,
      ge02: null,
      reachable: "unreachable",
      status: "—",
    };
    await handleConfirmWithDevice(manualDevice);
  };

  const handleSwapNow = async () => {
    if (!selectedDevice || !targetDevice || !vmanageCreds) return;
    setIsSwapping(true);
    setSwapError(null);

    try {
      if (!selectedDevice.serial) {
        throw new Error("Selected device has no serial number");
      }

      const invalidateResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/POST/invalidatedevice`,
        {
          chassisNumber: targetDevice.serial,
          deviceSystemIp: targetDevice.systemIp,
          ip: vmanageCreds.ip,
          username: vmanageCreds.username,
          password: vmanageCreds.password,
        },
      );

      if (invalidateResponse.status === 200) {
        const sendToControllerResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/POST/sendtocontroller`,
          {
            ip: vmanageCreds.ip,
            username: vmanageCreds.username,
            password: vmanageCreds.password,
            // Omit serial to push ALL pending changes to vSmart controllers
          }
        );

        if (sendToControllerResponse.status === 200) {
          setSwapSuccess(true);
          window.alert("Success! The device has been successfully invalidated and pushed to the controllers.");
          setTimeout(() => {
            setSwapSuccess(false);
            setShowPreconfigModal(false);
            setSelectedDevice(null);
            setTargetDevice(null);
            setPreconfigText("");
            setIsSwapping(false);
            setSwapError(null);
          }, 1500);
        } else {
          throw new Error("Failed to push to controller");
        }
      } else {
        throw new Error("Device invalidation failed");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Swap operation failed. Please try again.";
      setSwapError(errorMsg);
      setIsSwapping(false);
    }
  };

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
            backgroundColor: [accentGreen, accentRed],
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
  }, [reach, unreach, isDark]);

  useEffect(() => {
    if (showSwapModal) {
      setTimeout(() => swapInputRef.current?.focus(), 80);
    } else {
      setSwapQuery("");
    }
  }, [showSwapModal]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSwapModal(false);
    };
    if (showSwapModal) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSwapModal]);

  useEffect(() => {
    if (showSwapTargetModal) {
      setTimeout(() => swapTargetInputRef.current?.focus(), 80);
      setIsManualMode(false);
      setManualSerial("");
      setManualSerialError("");
    } else {
      setSwapTargetQuery("");
    }
  }, [showSwapTargetModal]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSwapTargetModal(false);
    };
    if (showSwapTargetModal) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSwapTargetModal]);

  const gridStyle: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(var(--theme-grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--theme-grid-line) 1px, transparent 1px)
    `,
    backgroundSize: "32px 32px",
  };

  const searchHintStyle: React.CSSProperties = {
    display: "flex",
    gap: "6px",
    padding: "8px 20px 12px",
    flexShrink: 0,
  };

  const searchHintTagStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 8px",
    borderRadius: "100px",
    border: "1px solid var(--theme-border)",
    background: "var(--theme-bg-secondary)",
    fontFamily: "'DM Mono', monospace",
    fontSize: "10px",
    letterSpacing: "0.06em",
    color: "var(--theme-text-muted)",
  };

  return (
    <>
      {showSwapModal && (
        <div
          className={styles.swapOverlay}
          onClick={() => setShowSwapModal(false)}
        >
          <div
            className={styles.swapModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.swapModalHeader}>
              <div className={styles.swapModalTitle}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Swap Device
              </div>
              <button
                className={styles.swapModalClose}
                onClick={() => setShowSwapModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.swapSearchWrap}>
              <span className={styles.swapSearchIcon}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="6.5"
                    cy="6.5"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 10l3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                ref={swapInputRef}
                className={styles.swapSearchInput}
                placeholder="Search by hostname, IP, or serial..."
                value={swapQuery}
                onChange={(e) => setSwapQuery(e.target.value)}
              />
              {swapQuery && (
                <button
                  onClick={() => setSwapQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--theme-text-muted)",
                    padding: "0 12px 0 0",
                    fontSize: "14px",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div style={searchHintStyle}>
              <span style={searchHintTagStyle}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 6h6M3 4h6M3 8h4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                Hostname
              </span>
              <span style={searchHintTagStyle}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <circle
                    cx="6"
                    cy="6"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 6h4M6 4v4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                System IP
              </span>
              <span style={searchHintTagStyle}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4h8M2 8h5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Serial
              </span>
            </div>
            <div className={styles.swapDivider} />
            <div className={styles.swapResultCount}>
              {swapFiltered.length} device{swapFiltered.length !== 1 ? "s" : ""}{" "}
              found
            </div>
            <div className={styles.swapList}>
              {swapFiltered.length === 0 ? (
                <div className={styles.swapEmpty}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M16.5 16.5L21 21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  No devices matched
                </div>
              ) : (
                swapFiltered.map((d, idx) => (
                  <div key={idx} className={styles.swapListItem}>
                    <div className={styles.swapItemLeft}>
                      <div className={styles.swapItemIcon}>
                        {d.type?.slice(0, 2).toUpperCase() ?? "—"}
                      </div>
                      <div>
                        <div className={styles.swapItemHostname}>
                          {highlightMatch(d.hostname, swapQuery)}
                        </div>
                        <div className={styles.swapItemIp}>
                          {highlightMatch(d.systemIp, swapQuery)}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--theme-text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {d.serial ? highlightMatch(d.serial, swapQuery) : "—"}
                        </div>
                      </div>
                    </div>
                    <div className={styles.swapItemRight}>
                      <span className={styles.swapItemType}>{d.type}</span>
                      <span
                        className={cn(
                          styles.statusBadge,
                          d.reachable === "reachable" ? styles.up : styles.down,
                        )}
                      >
                        <span
                          className={cn(
                            styles.statusDot,
                            d.reachable === "reachable"
                              ? styles.up
                              : styles.down,
                          )}
                        />
                        {d.reachable === "reachable" ? "Up" : "Down"}
                      </span>
                      <button
                        className={styles.swapItemActionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDevice(d);
                          setShowSwapModal(false);
                          setShowSwapTargetModal(true);
                        }}
                      >
                        Swap
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showSwapTargetModal && (
        <div
          className={styles.swapOverlay}
          onClick={() => setShowSwapTargetModal(false)}
        >
          <div
            className={styles.swapModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.swapModalHeader}>
              <div className={styles.swapModalTitle}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Select Replacement
              </div>
              <button
                className={styles.swapModalClose}
                onClick={() => setShowSwapTargetModal(false)}
              >
                ✕
              </button>
            </div>
            {selectedDevice && (
              <div style={{ padding: "12px 20px 0" }}>
                <div className={styles.swapTargetFrom}>
                  <span className={styles.swapTargetFromLabel}>From</span>
                  <span className={styles.swapTargetFromArrow}>→</span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      flex: 1,
                    }}
                  >
                    <span className={styles.swapTargetFromHostname}>
                      {selectedDevice.hostname}
                    </span>
                    <span className={styles.swapTargetFromIp}>
                      {selectedDevice.systemIp}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--theme-text-muted)",
                      }}
                    >
                      {selectedDevice.serial ?? "—"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      styles.statusBadge,
                      selectedDevice.reachable === "reachable"
                        ? styles.up
                        : styles.down,
                    )}
                    style={{ flexShrink: 0 }}
                  >
                    <span
                      className={cn(
                        styles.statusDot,
                        selectedDevice.reachable === "reachable"
                          ? styles.up
                          : styles.down,
                      )}
                    />
                    {selectedDevice.reachable === "reachable" ? "Up" : "Down"}
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0",
                padding: "14px 20px 0",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => {
                  setIsManualMode(false);
                  setManualSerial("");
                  setManualSerialError("");
                }}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: "8px 0 0 8px",
                  border: "1px solid var(--theme-border-strong)",
                  borderRight: "none",
                  background: !isManualMode
                    ? "var(--theme-accent-green)"
                    : "var(--theme-bg-secondary)",
                  color: !isManualMode
                    ? "var(--theme-on-accent)"
                    : "var(--theme-text-muted)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                SEARCH LIST
              </button>
              <button
                onClick={() => {
                  setIsManualMode(true);
                  setSwapTargetQuery("");
                  setManualSerialError("");
                }}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: "0 8px 8px 0",
                  border: "1px solid var(--theme-border-strong)",
                  background: isManualMode
                    ? "var(--theme-accent-green)"
                    : "var(--theme-bg-secondary)",
                  color: isManualMode
                    ? "var(--theme-on-accent)"
                    : "var(--theme-text-muted)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                MANUAL SERIAL
              </button>
            </div>

            {isManualMode ? (
              <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      color: "var(--theme-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Replacement Device Serial Number
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "0 12px",
                        borderRadius: "10px",
                        border: `1px solid ${manualSerialError ? "var(--theme-accent-red)" : "var(--theme-border-strong)"}`,
                        background: "var(--theme-bg-secondary)",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{
                          flexShrink: 0,
                          color: "var(--theme-text-muted)",
                        }}
                      >
                        <path
                          d="M2 5h12M2 8h8M2 11h5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        autoFocus
                        value={manualSerial}
                        onChange={(e) => {
                          setManualSerial(e.target.value);
                          if (manualSerialError) setManualSerialError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleManualSerialConfirm();
                        }}
                        placeholder="e.g. ISR1100-4GLTEGB-FGL2532LKYU"
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "12px",
                          color: "var(--theme-text-primary)",
                          letterSpacing: "0.04em",
                          padding: "10px 0",
                        }}
                      />
                      {manualSerial && (
                        <button
                          onClick={() => {
                            setManualSerial("");
                            setManualSerialError("");
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--theme-text-muted)",
                            fontSize: "13px",
                            lineHeight: 1,
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleManualSerialConfirm}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "0 16px",
                        borderRadius: "10px",
                        border: "none",
                        background: "var(--theme-accent-green)",
                        color: "var(--theme-on-accent)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8l4 4 6-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Confirm
                    </button>
                  </div>
                  {manualSerialError && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "11px",
                        color: "var(--theme-accent-red)",
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6 4v3M6 8.5v.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      {manualSerialError}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: "var(--theme-bg-secondary)",
                      border: "1px solid var(--theme-border)",
                      marginTop: "2px",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        flexShrink: 0,
                        color: "var(--theme-text-muted)",
                      }}
                    >
                      <circle
                        cx="6"
                        cy="6"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M6 5.5v3M6 4v.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "11px",
                        color: "var(--theme-text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      Enter the serial number of the new replacement device.
                      This will be used to invalidate and push to controller.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.swapSearchWrap}>
                  <span className={styles.swapSearchIcon}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle
                        cx="6.5"
                        cy="6.5"
                        r="4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 10l3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    ref={swapTargetInputRef}
                    className={styles.swapSearchInput}
                    placeholder="Search by hostname, IP, or serial..."
                    value={swapTargetQuery}
                    onChange={(e) => setSwapTargetQuery(e.target.value)}
                  />
                  {swapTargetQuery && (
                    <button
                      onClick={() => setSwapTargetQuery("")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--theme-text-muted)",
                        padding: "0 12px 0 0",
                        fontSize: "14px",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div style={searchHintStyle}>
                  <span style={searchHintTagStyle}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <rect
                        x="1"
                        y="1"
                        width="10"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 6h6M3 4h6M3 8h4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Hostname
                  </span>
                  <span style={searchHintTagStyle}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <circle
                        cx="6"
                        cy="6"
                        r="4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M4 6h4M6 4v4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    System IP
                  </span>
                  <span style={searchHintTagStyle}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 4h8M2 8h5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Serial
                  </span>
                </div>
                <div className={styles.swapDivider} />
                <div className={styles.swapResultCount}>
                  {swapTargetFiltered.length} device
                  {swapTargetFiltered.length !== 1 ? "s" : ""} found
                </div>
                <div className={styles.swapList}>
                  {swapTargetFiltered.length === 0 ? (
                    <div className={styles.swapEmpty}>
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M16.5 16.5L21 21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      No devices matched
                    </div>
                  ) : (
                    swapTargetFiltered.map((d, idx) => (
                      <div key={idx} className={styles.swapListItem}>
                        <div className={styles.swapItemLeft}>
                          <div className={styles.swapItemIcon}>
                            {d.type?.slice(0, 2).toUpperCase() ?? "—"}
                          </div>
                          <div>
                            <div className={styles.swapItemHostname}>
                              {highlightMatch(d.hostname, swapTargetQuery)}
                            </div>
                            <div className={styles.swapItemIp}>
                              {highlightMatch(d.systemIp, swapTargetQuery)}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--theme-text-muted)",
                                marginTop: "2px",
                              }}
                            >
                              {d.serial
                                ? highlightMatch(d.serial, swapTargetQuery)
                                : "—"}
                            </div>
                          </div>
                        </div>
                        <div className={styles.swapItemRight}>
                          <span className={styles.swapItemType}>{d.type}</span>
                          <span
                            className={cn(
                              styles.statusBadge,
                              d.reachable === "reachable"
                                ? styles.up
                                : styles.down,
                            )}
                          >
                            <span
                              className={cn(
                                styles.statusDot,
                                d.reachable === "reachable"
                                  ? styles.up
                                  : styles.down,
                              )}
                            />
                            {d.reachable === "reachable" ? "Up" : "Down"}
                          </span>
                          <button
                            className={styles.swapItemActionBtn}
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleConfirmWithDevice(d);
                            }}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPreconfigModal && selectedDevice && targetDevice && (
        <div
          className={styles.swapOverlay}
          onClick={() => {
            setShowPreconfigModal(false);
            setSelectedDevice(null);
            setTargetDevice(null);
            setPreconfigText("");
            setSwapError(null);
          }}
        >
          <div
            className={styles.swapModal}
            style={{ width: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.swapModalHeader}>
              <div className={styles.swapModalTitle}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="3"
                    width="12"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 7h6M5 10h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Preconfigure Command
              </div>
              <button
                className={styles.swapModalClose}
                onClick={() => {
                  setShowPreconfigModal(false);
                  setSelectedDevice(null);
                  setTargetDevice(null);
                  setPreconfigText("");
                  setSwapError(null);
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
              <div className={styles.preconfigRoute}>
                <div className={styles.preconfigRouteDevice}>
                  <span className={styles.preconfigRouteTag}>From</span>
                  <span className={styles.preconfigRouteHostname}>
                    {selectedDevice.hostname}
                  </span>
                  <span className={styles.preconfigRouteIp}>
                    {selectedDevice.systemIp}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                      color: "var(--theme-text-muted)",
                      letterSpacing: "0.04em",
                      marginTop: "2px",
                    }}
                  >
                    {selectedDevice.serial ?? "—"}
                  </span>
                </div>
                <div className={styles.preconfigRouteArrow}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div
                  className={styles.preconfigRouteDevice}
                  style={{ textAlign: "right" }}
                >
                  <span className={styles.preconfigRouteTag}>To</span>
                  <span className={styles.preconfigRouteHostname}>
                    {targetDevice.hostname}
                  </span>
                  <span className={styles.preconfigRouteIp}>
                    {targetDevice.systemIp}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                      color: "var(--theme-text-muted)",
                      letterSpacing: "0.04em",
                      marginTop: "2px",
                    }}
                  >
                    {targetDevice.serial ?? "—"}
                  </span>
                </div>
              </div>
            </div>
            {swapError && (
              <div
                style={{
                  padding: "14px 20px 0",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "rgba(255,68,85,0.1)",
                    border: "1px solid var(--theme-accent-red)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      marginTop: "2px",
                      color: "var(--theme-accent-red)",
                    }}
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 5v4M8 12v.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      color: "var(--theme-accent-red)",
                      lineHeight: 1.4,
                    }}
                  >
                    {swapError}
                  </span>
                </div>
              </div>
            )}
            <div
              className={styles.preconfigCmdSection}
              style={{ marginTop: 14, flex: 1, overflow: "auto", minHeight: 0 }}
            >
              <div className={styles.preconfigCmdLabel}>
                Preconfigure Command
              </div>
              <div className={styles.preconfigCmdWrap}>
                <div className={styles.preconfigCmdBar}>
                  <div className={styles.preconfigCmdDots}>
                    <div
                      className={styles.preconfigCmdDot}
                      style={{ background: "#FF5F57" }}
                    />
                    <div
                      className={styles.preconfigCmdDot}
                      style={{ background: "#FFBD2E" }}
                    />
                    <div
                      className={styles.preconfigCmdDot}
                      style={{ background: "#28CA41" }}
                    />
                  </div>
                  <button
                    className={styles.preconfigCmdCopy}
                    onClick={() => {
                      navigator.clipboard.writeText(preconfigText);
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className={styles.preconfigCmdBody}>
                  <textarea
                    value={preconfigText}
                    onChange={(e) => setPreconfigText(e.target.value)}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      minHeight: "180px",
                      height: "150px",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "12px",
                      lineHeight: "1.7",
                      background: "transparent",
                      color: "#C8F0D0",
                      border: "none",
                      outline: "none",
                      resize: "vertical",
                      padding: "0",
                      overflowY: "auto",
                      boxSizing: "border-box",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className={styles.preconfigFooter}
              style={{ marginTop: "12px" }}
            >
              <button
                className={styles.preconfigCloseBtn}
                disabled={isSwapping}
                onClick={() => {
                  setShowPreconfigModal(false);
                  setSelectedDevice(null);
                  setTargetDevice(null);
                  setPreconfigText("");
                  setSwapError(null);
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSwapNow}
                disabled={isSwapping || swapSuccess}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 20px",
                  borderRadius: "100px",
                  border: "none",
                  background: swapSuccess
                    ? "var(--theme-accent-green)"
                    : "linear-gradient(135deg, var(--theme-accent-green), var(--theme-accent-light))",
                  color: "var(--theme-on-accent)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: isSwapping || swapSuccess ? "not-allowed" : "pointer",
                  opacity: isSwapping ? 0.75 : 1,
                  transition: "all 0.25s ease",
                  boxShadow: "0 0 14px var(--theme-accent-glow)",
                }}
              >
                {isSwapping ? (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="28"
                        strokeDashoffset="10"
                        strokeLinecap="round"
                      />
                    </svg>
                    Proceeding…
                  </>
                ) : swapSuccess ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l4 4 6-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Done!
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Proceed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.dbRoot}>
        <div className={styles.metricGrid}>
          {[
            {
              label: "Total Devices",
              value: total,
              color: "var(--theme-text-primary)",
              bar: "var(--theme-border)",
              icon: "DEV",
              sub: "monitored",
              cls: styles.anim0,
            },
            {
              label: "Reachable",
              value: reach,
              color: accentGreen,
              bar: `linear-gradient(90deg,${accentGreen},${accentLight})`,
              icon: "UP",
              sub: "online now",
              cls: styles.anim1,
            },
            {
              label: "Unreachable",
              value: unreach,
              color: accentRed,
              bar: `linear-gradient(90deg,${accentRed},${isDark ? "#FF8866" : "#F09595"})`,
              icon: "DN",
              sub: "offline",
              cls: styles.anim2,
            },
            {
              label: "Sites",
              value: sites,
              color: "var(--theme-text-primary)",
              bar: "linear-gradient(90deg,#7F77DD,#AFA9EC)",
              icon: "LOC",
              sub: "locations",
              cls: styles.anim3,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={cn(styles.metricCard, m.cls)}
              style={gridStyle}
            >
              <div className={styles.accentBar} style={{ background: m.bar }} />
              <div className={styles.mLabel}>{m.label}</div>
              <div className={styles.mValue} style={{ color: m.color }}>
                {m.value}
              </div>
              <div className={styles.mSub}>{m.sub}</div>
              <div className={styles.mIcon}>{m.icon}</div>
            </div>
          ))}
        </div>

        <div className={styles.wanGrid}>
          <div
            className={cn(styles.panel, styles.animPanel1)}
            style={gridStyle}
          >
            <div className={styles.panelTitle}>WAN Edge Health</div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div className={styles.donutWrap}>
                {isDark && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />
                )}
                <canvas
                  ref={donutRef}
                  width={160}
                  height={160}
                  role="img"
                  aria-label="Donut chart showing WAN edge health"
                  style={{ position: "relative", zIndex: 1 }}
                />
                <div className={styles.donutCenter}>
                  <div className={styles.donutNum}>{total}</div>
                  <div className={styles.donutSub}>WAN Edges</div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flex: 1,
                }}
              >
                {[
                  { colorClass: "green", label: "Reachable", count: reach },
                  { colorClass: "red", label: "Unreachable", count: unreach },
                ].map((l) => (
                  <div key={l.label} className={styles.legendItem}>
                    <span
                      className={cn(
                        styles.legendDot,
                        l.colorClass === "green" ? styles.green : styles.red,
                      )}
                    />
                    <span>{l.label}</span>
                    <span className={styles.legendCount}>{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={cn(styles.panel, styles.animPanel2)}
            style={gridStyle}
          >
            <div className={styles.panelTitle}>
              Site BFD Connectivity ({sites})
            </div>
            {[
              {
                label: "Reachable",
                count: reach,
                bg: isDark ? "rgba(0,255,136,0.08)" : "#EAF3DE",
                color: isDark ? "#00FF88" : "#3B6D11",
                letter: "R",
              },
              {
                label: "Partial",
                count: partial,
                bg: isDark ? "rgba(255,200,80,0.08)" : "#FAEEDA",
                color: isDark ? "#FFD060" : "#854F0B",
                letter: "P",
              },
              {
                label: "Unreachable",
                count: unreach,
                bg: isDark ? "rgba(255,68,85,0.08)" : "#FCEBEB",
                color: isDark ? "#FF4455" : "#A32D2D",
                letter: "U",
              },
            ].map((row) => (
              <div key={row.label} className={styles.bfdRow}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    className={styles.bfdPill}
                    style={{
                      background: row.bg,
                      color: row.color,
                      border: `1px solid ${row.color}22`,
                    }}
                  >
                    {row.letter}
                  </span>
                  <span className={styles.bfdLabel}>{row.label}</span>
                </div>
                <span className={styles.bfdCount}>{row.count}</span>
              </div>
            ))}
            <div className={styles.pbarWrap}>
              <div className={styles.pbarHeader}>
                <span className={styles.pbarLabel}>Reachability Rate</span>
                <span className={styles.pbarPct}>{pct}%</span>
              </div>
              <div className={styles.pbarTrack}>
                <div className={styles.pbarFill} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className={cn(styles.panel, styles.animTable)} style={gridStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div className={styles.panelTitle} style={{ margin: 0, flex: 1 }}>
              Device List
            </div>
            <div className={styles.filterBar}>
              <button
                className={styles.swapBtn}
                onClick={() => setShowSwapModal(true)}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Swap
              </button>
              {(["all", "reachable", "unreachable"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    styles.filterBtn,
                    filter === f && styles.active,
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.tbl}>
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    "Hostname",
                    "Serial",
                    "System IP",
                    "Site ID",
                    "Type",
                    "eth0",
                    "ge0/1 IP",
                    "ge0/2 IP",
                    "Status",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--theme-text-muted)",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "12px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      No devices found
                    </td>
                  </tr>
                ) : (
                  filtered.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{d.hostname}</td>
                      <td
                        className={cn(styles.mono, !d.serial && styles.muted)}
                      >
                        {d.serial ?? "—"}
                      </td>
                      <td className={styles.mono}>{d.systemIp}</td>
                      <td>{d.siteId}</td>
                      <td
                        style={{
                          textTransform: "uppercase",
                          fontSize: "11px",
                          letterSpacing: "0.04em",
                          fontWeight: 600,
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {d.type}
                      </td>
                      <td className={cn(styles.mono, !d.eth0 && styles.muted)}>
                        {d.eth0 ?? "—"}
                      </td>
                      <td className={cn(styles.mono, !d.ge01 && styles.muted)}>
                        {d.ge01 ?? "—"}
                      </td>
                      <td className={cn(styles.mono, !d.ge02 && styles.muted)}>
                        {d.ge02 ?? "—"}
                      </td>
                      <td>
                        <span
                          className={cn(
                            styles.statusBadge,
                            d.reachable === "reachable"
                              ? styles.up
                              : styles.down,
                          )}
                        >
                          <span
                            className={cn(
                              styles.statusDot,
                              d.reachable === "reachable"
                                ? styles.up
                                : styles.down,
                            )}
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
    </>
  );
}

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [vmanageCreds, setVmanageCreds] = useState<VManageCreds | null>(null);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty(
      "--color-background-primary",
      theme["--theme-bg-primary"],
    );
    root.style.setProperty(
      "--color-background-secondary",
      theme["--theme-bg-secondary"],
    );
    root.style.setProperty(
      "--color-text-primary",
      theme["--theme-text-primary"],
    );
    root.style.setProperty(
      "--color-text-secondary",
      theme["--theme-text-secondary"],
    );
    root.style.setProperty("--color-border-tertiary", theme["--theme-border"]);
    root.style.background = theme["--theme-bg-base"];
    document.body.style.background = theme["--theme-bg-base"];
    document.body.style.transition = "background 0.4s ease";
  }, [isDark]);

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
        { ip: credentials.ip, cookie: authenResponse.data.cookie },
      );

      if (deviceResponse.status === 200) {
        setShowModal(false);
        setConnectionError(false);
        setIsConnected(true);
        setVmanageCreds(credentials);

        const data = deviceResponse.data.data.data;

        const allDevices = data;

        const deviceIds = allDevices.map(
          (device: { deviceId: any }) => device.deviceId,
        );
        const systemip = allDevices.map(
          (device: { ["system-ip"]: string }) => device["system-ip"],
        );
        const hostnames = allDevices.map(
          (device: { ["host-name"]: string }) => device["host-name"],
        );
        const siteIds = allDevices.map(
          (device: { ["site-id"]: string }) => device["site-id"],
        );
        const reachability = allDevices.map(
          (device: { reachability: any }) => device.reachability,
        );
        const status = allDevices.map(
          (device: { status: any }) => device.status,
        );
        const deviceTypes = allDevices.map(
          (device: { "device-type": string }) => device["device-type"],
        );
        const uuid = allDevices.map(
          (device: { uuid: string }) => device["uuid"],
        );

        for (let i = 0; i < deviceIds.length; i++) {
          let ge01Ip: string | null = null;
          let ge02Ip: string | null = null;
          let eth0Ip: string | null = null;

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

            const { if1, if2 } = resolveIfnames(deviceTypes[i]);

            const iface1 =
              interfaces.find(
                (int: any) => int["af-type"] === "ipv4" && int.ifname === if1,
              ) ?? null;

            const iface2 =
              interfaces.find(
                (int: any) => int["af-type"] === "ipv4" && int.ifname === if2,
              ) ?? null;

            const eth0Iface =
              interfaces.find(
                (int: any) =>
                  int["af-type"] === "ipv4" && int.ifname === "eth0",
              ) ?? null;

            ge01Ip = iface1?.["ip-address"] ?? null;
            ge02Ip = iface2?.["ip-address"] ?? null;
            eth0Ip = eth0Iface?.["ip-address"] ?? null;
          } catch (error) {
            null;
          }

          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_URL}/api/POST/pushdeviceinfo`,
              {
                hostname: hostnames[i],
                systemip: systemip[i],
                siteid: siteIds[i],
                eth0: eth0Ip,
                ipad1: ge01Ip,
                ipad2: ge02Ip,
                deviceType: deviceTypes[i],
                reachable: reachability[i],
                serial: uuid[i],
              },
            );
          } catch (error) {
            null;
          }

          setDevices((prev) => [
            ...prev,
            {
              hostname: hostnames[i],
              serial: uuid[i],
              systemIp: systemip[i],
              siteId: siteIds[i],
              type: deviceTypes[i],
              eth0: eth0Ip,
              ge01: ge01Ip,
              ge02: ge02Ip,
              reachable: reachability[i],
              status: status[i],
            },
          ]);
        }
      }
    } catch (error) {
      setShowModal(false);
      setConnectionError(true);
    }
  };

  const handleReconnect = () => {
    setConnectionError(false);
    setShowModal(true);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "var(--theme-bg-base)",
        transition: "background 0.4s ease",
      }}
    >
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"
        onLoad={() => setChartReady(true)}
      />

      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />

      {showModal && (
        <VManageConnectionModal
          onConnect={handleConnect}
          onClose={() => setShowModal(false)}
        />
      )}

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
          <DeviceDashboard
            devices={devices}
            isDark={isDark}
            vmanageCreds={vmanageCreds}
          />
        ) : connectionError ? (
          <ConnectionErrorBanner onReconnect={handleReconnect} />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              gap: "20px",
            }}
          >
            <div
              style={{ position: "relative", width: "72px", height: "72px" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid var(--theme-border)",
                  borderTop: "2px solid var(--theme-accent-green)",
                  animation: "spin 1.2s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "10px",
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTop: "2px solid var(--theme-accent-light)",
                  animation: "spin 1.8s linear infinite reverse",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--theme-accent-green)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5C5 8.91 7.91 6 11.5 6c2.17 0 4.08 1.03 5.3 2.63M19 11.5C19 15.09 16.09 18 12.5 18c-2.17 0-4.08-1.03-5.3-2.63"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16.5 6l.3 2.63M7.5 18l-.3-2.63"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--theme-text-muted)",
                }}
              >
                Awaiting Connection
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "var(--theme-text-muted)",
                  opacity: 0.7,
                }}
              >
                No vManage controller connected
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "10px",
                border: "none",
                background: "var(--theme-accent-green)",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.01em",
                boxShadow: "0 4px 14px var(--theme-accent-glow)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 6px 20px var(--theme-accent-glow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 14px var(--theme-accent-glow)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5C5 8.91 7.91 6 11.5 6c2.17 0 4.08 1.03 5.3 2.63M19 11.5C19 15.09 16.09 18 12.5 18c-2.17 0-4.08-1.03-5.3-2.63"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16.5 6l.3 2.63M7.5 18l-.3-2.63"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Connect to vManage
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
