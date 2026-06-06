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

const lightTheme = {
  "--theme-bg-base": "#F0F4F8",
  "--theme-bg-primary": "#FFFFFF",
  "--theme-bg-secondary": "#E8EEF4",
  "--theme-bg-card": "#FFFFFF",
  "--theme-bg-glass": "rgba(255,255,255,0.85)",
  "--theme-border": "rgba(99,153,34,0.15)",
  "--theme-border-strong": "rgba(99,153,34,0.3)",
  "--theme-text-primary": "#0D1B0A",
  "--theme-text-secondary": "#4A6741",
  "--theme-text-muted": "#7A9E6F",
  "--theme-accent-green": "#1D9E75",
  "--theme-accent-red": "#E24B4A",
  "--theme-accent-glow": "rgba(29,158,117,0.18)",
  "--theme-badge-up-bg": "#EAF3DE",
  "--theme-badge-up-color": "#3B6D11",
  "--theme-badge-down-bg": "#FCEBEB",
  "--theme-badge-down-color": "#A32D2D",
  "--theme-grid-line": "rgba(29,158,117,0.06)",
  "--theme-shadow":
    "0 4px 24px rgba(29,158,117,0.08), 0 1px 4px rgba(0,0,0,0.04)",
  "--theme-shadow-card": "0 2px 12px rgba(29,158,117,0.1)",
  "--theme-filter-active-bg": "#E8F5E8",
  "--theme-filter-active-color": "#1D9E75",
  "--theme-scan-line": "rgba(29,158,117,0.03)",
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
  "--theme-accent-glow": "rgba(0,255,136,0.12)",
  "--theme-badge-up-bg": "rgba(0,255,136,0.1)",
  "--theme-badge-up-color": "#00FF88",
  "--theme-badge-down-bg": "rgba(255,68,85,0.1)",
  "--theme-badge-down-color": "#FF4455",
  "--theme-grid-line": "rgba(0,255,136,0.04)",
  "--theme-shadow": "0 0 30px rgba(0,255,136,0.06), 0 4px 20px rgba(0,0,0,0.6)",
  "--theme-shadow-card":
    "0 0 20px rgba(0,255,136,0.08), inset 0 1px 0 rgba(0,255,136,0.06)",
  "--theme-filter-active-bg": "rgba(0,255,136,0.12)",
  "--theme-filter-active-color": "#00FF88",
  "--theme-scan-line": "rgba(0,255,136,0.03)",
  "--theme-noise":
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
};

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
            background: isDark ? "#030C06" : "var(--theme-accent-green)",
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
      <style>{`
        @keyframes errPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.3); }
          50% { box-shadow: 0 0 0 10px rgba(226,75,74,0); }
        }
        @keyframes errFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .err-banner { animation: errFadeIn 0.35s ease both; }
        .reconnect-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .reconnect-btn:active { transform: translateY(0); }
      `}</style>
      <div
        className="err-banner"
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
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
              color: "var(--theme-text-primary)",
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
          className="reconnect-btn"
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
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
}: {
  devices: Device[];
  isDark: boolean;
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
    .filter((d) => d.hostname.toLowerCase().includes(swapQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.reachable !== "reachable" && b.reachable === "reachable") return -1;
      if (a.reachable === "reachable" && b.reachable !== "reachable") return 1;
      return 0;
    });

  const swapTargetFiltered = devices
    .filter(
      (d) =>
        d.hostname !== selectedDevice?.hostname &&
        d.hostname.toLowerCase().includes(swapTargetQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (a.reachable === "reachable" && b.reachable !== "reachable") return -1;
      if (a.reachable !== "reachable" && b.reachable === "reachable") return 1;
      return 0;
    });

  const accentGreen = isDark ? "#00FF88" : "#1D9E75";
  const accentRed = isDark ? "#FF4455" : "#E24B4A";

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .db-root {
          padding: 2rem 0;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

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
          background: var(--theme-bg-card);
          border: 1px solid var(--theme-border);
          box-shadow: var(--theme-shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: default;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          border-color: var(--theme-border-strong);
          box-shadow: var(--theme-shadow-card), 0 8px 32px rgba(0,0,0,0.2);
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
          color: var(--theme-text-secondary);
          margin-bottom: 10px;
          font-family: 'DM Mono', monospace;
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
          color: var(--theme-text-muted);
          margin-top: 6px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.04em;
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
          color: var(--theme-text-primary);
        }

        .panel {
          background: var(--theme-bg-card);
          border: 1px solid var(--theme-border);
          border-radius: 18px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: var(--theme-shadow);
          transition: border-color 0.2s ease;
        }
        .panel:hover { border-color: var(--theme-border-strong); }
        .panel-title {
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--theme-text-secondary);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Mono', monospace;
        }
        .panel-title::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: var(--theme-border);
        }

        .wan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--theme-text-secondary);
          padding: 10px 14px;
          border-radius: 10px;
          background: var(--theme-bg-secondary);
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .legend-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-dot.green { background: ${accentGreen}; box-shadow: 0 0 0 3px ${isDark ? "rgba(0,255,136,0.15)" : "rgba(29,158,117,0.15)"}; }
        .legend-dot.red { background: ${accentRed}; box-shadow: 0 0 0 3px ${isDark ? "rgba(255,68,85,0.15)" : "rgba(226,75,74,0.15)"}; }
        .legend-count {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--theme-text-primary);
          margin-left: auto;
        }

        .bfd-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 0.5px solid var(--theme-border);
          transition: padding-left 0.15s ease;
        }
        .bfd-row:last-of-type { border-bottom: none; }
        .bfd-row:hover { padding-left: 4px; }
        .bfd-pill {
          width: 26px; height: 26px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          flex-shrink: 0;
          font-family: 'DM Mono', monospace;
        }
        .bfd-label { font-size: 14px; color: var(--theme-text-primary); font-family: 'DM Sans', sans-serif; }
        .bfd-count {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 700;
          color: var(--theme-text-primary);
        }

        .pbar-wrap {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 0.5px solid var(--theme-border);
        }
        .pbar-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 8px;
        }
        .pbar-label { font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; color: var(--theme-text-secondary); font-family: 'DM Mono', monospace; }
        .pbar-pct { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: var(--theme-text-primary); }
        .pbar-track {
          background: var(--theme-bg-secondary);
          border-radius: 100px;
          height: 8px;
          overflow: hidden;
        }
        .pbar-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, ${accentGreen} 0%, ${isDark ? "#00FFCC" : "#5DCAA5"} 100%);
          transition: width 1s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          ${isDark ? "box-shadow: 0 0 10px rgba(0,255,136,0.4);" : ""}
        }
        .pbar-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 20px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25));
          border-radius: inherit;
        }

        .filter-bar { display: flex; gap: 6px; }
        .filter-btn {
          font-size: 12px;
          padding: 5px 14px;
          border-radius: 100px;
          border: 0.5px solid var(--theme-border);
          background: transparent;
          color: var(--theme-text-secondary);
          font-weight: 400;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
          letter-spacing: 0.01em;
        }
        .filter-btn.active {
          background: var(--theme-filter-active-bg);
          color: var(--theme-filter-active-color);
          border-color: var(--theme-border-strong);
          font-weight: 500;
          ${isDark ? "box-shadow: 0 0 10px var(--theme-accent-glow);" : ""}
        }
        .filter-btn:not(.active):hover {
          background: var(--theme-bg-secondary);
          color: var(--theme-text-primary);
          border-color: var(--theme-border-strong);
        }
        .tbl { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
        .tbl th {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--theme-text-secondary);
          text-align: left;
          padding: 10px 12px;
          border-bottom: 0.5px solid var(--theme-border);
          font-family: 'DM Mono', monospace;
        }
        .tbl td {
          padding: 11px 12px;
          border-bottom: 0.5px solid var(--theme-border);
          color: var(--theme-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background 0.1s;
        }
        .tbl tr:hover td { background: var(--theme-accent-glow); }
        .tbl tr:last-child td { border-bottom: none; }
        .tbl td.muted { color: var(--theme-text-muted); font-style: italic; }
        .tbl td.mono { font-family: 'DM Mono', monospace; font-size: 12px; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-family: 'DM Mono', monospace;
        }
        .status-badge.up { background: var(--theme-badge-up-bg); color: var(--theme-badge-up-color); border: 1px solid ${isDark ? "rgba(0,255,136,0.2)" : "rgba(29,158,117,0.15)"}; }
        .status-badge.down { background: var(--theme-badge-down-bg); color: var(--theme-badge-down-color); border: 1px solid ${isDark ? "rgba(255,68,85,0.2)" : "rgba(226,75,74,0.15)"}; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.up { background: ${accentGreen}; ${isDark ? "box-shadow: 0 0 5px " + accentGreen + ";" : ""} animation: pulsedot 2s ease-in-out infinite; }
        .status-dot.down { background: ${accentRed}; }
        @keyframes pulsedot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.8); }
        }

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
          color: var(--theme-text-primary);
          line-height: 1;
        }
        .donut-sub {
          font-size: 10px; color: var(--theme-text-muted);
          margin-top: 3px; letter-spacing: 0.06em; text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        .swap-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          padding: 5px 14px;
          border-radius: 100px;
          border: 0.5px solid var(--theme-accent-green);
          background: transparent;
          color: var(--theme-accent-green);
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
          letter-spacing: 0.01em;
          ${isDark ? "box-shadow: 0 0 10px rgba(0,255,136,0.08);" : ""}
        }
        .swap-btn:hover {
          background: var(--theme-accent-green);
          color: ${isDark ? "#030C06" : "#ffffff"};
          ${isDark ? "box-shadow: 0 0 16px rgba(0,255,136,0.25);" : ""}
        }
        .swap-btn svg { flex-shrink: 0; transition: transform 0.3s ease; }
        .swap-btn:hover svg { transform: rotate(180deg); }

        .swap-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: overlayIn 0.18s ease both;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .swap-modal {
          background: var(--theme-bg-card);
          border: 1px solid var(--theme-border-strong);
          border-radius: 20px;
          width: 520px;
          max-width: calc(100vw - 32px);
          max-height: 70vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--theme-shadow), 0 24px 60px rgba(0,0,0,0.3);
          animation: modalIn 0.22s cubic-bezier(0.23,1,0.32,1) both;
          overflow: hidden;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .swap-modal-header {
          padding: 20px 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .swap-modal-title {
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--theme-text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Mono', monospace;
        }
        .swap-modal-close {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: var(--theme-bg-secondary);
          border: 0.5px solid var(--theme-border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 14px;
          color: var(--theme-text-secondary);
          transition: all 0.15s ease;
          line-height: 1;
        }
        .swap-modal-close:hover {
          background: var(--theme-accent-red);
          color: #ffffff;
          border-color: var(--theme-accent-red);
        }

        .swap-search-wrap { padding: 14px 20px 12px; position: relative; }
        .swap-search-icon {
          position: absolute;
          left: 32px; top: 50%;
          transform: translateY(-50%);
          color: var(--theme-text-muted);
          pointer-events: none;
          display: flex; align-items: center;
        }
        .swap-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 14px 10px 38px;
          border-radius: 10px;
          border: 1px solid var(--theme-border);
          background: var(--theme-bg-secondary);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--theme-text-primary);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .swap-search-input::placeholder { color: var(--theme-text-muted); }
        .swap-search-input:focus {
          border-color: var(--theme-accent-green);
          box-shadow: 0 0 0 3px var(--theme-accent-glow);
        }

        .swap-divider { height: 0.5px; background: var(--theme-border); margin: 0 20px; }
        .swap-result-count {
          padding: 8px 20px 4px;
          font-size: 10.5px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--theme-text-muted);
          font-family: 'DM Mono', monospace;
        }

        .swap-list {
          overflow-y: auto; flex: 1; padding: 4px 12px 12px;
        }
        .swap-list::-webkit-scrollbar { width: 4px; }
        .swap-list::-webkit-scrollbar-track { background: transparent; }
        .swap-list::-webkit-scrollbar-thumb { background: var(--theme-border); border-radius: 4px; }

        .swap-list-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 10px; border-radius: 10px; cursor: pointer;
          transition: background 0.12s ease; gap: 12px;
        }
        .swap-list-item:hover { background: var(--theme-bg-secondary); }
        .swap-item-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .swap-item-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--theme-bg-secondary);
          border: 0.5px solid var(--theme-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: var(--theme-text-secondary);
          font-family: 'DM Mono', monospace;
          flex-shrink: 0; letter-spacing: 0;
        }
        .swap-item-hostname { font-size: 13px; font-weight: 500; color: var(--theme-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'DM Sans', sans-serif; }
        .swap-item-ip { font-size: 11px; color: var(--theme-text-muted); font-family: 'DM Mono', monospace; margin-top: 2px; }
        .swap-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .swap-item-type {
          font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--theme-text-secondary); background: var(--theme-bg-secondary);
          border: 0.5px solid var(--theme-border); border-radius: 6px; padding: 2px 7px;
          font-family: 'DM Mono', monospace;
        }
        .swap-item-action-btn {
          font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px;
          border: 0.5px solid var(--theme-accent-green); background: transparent; color: var(--theme-accent-green);
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s ease; letter-spacing: 0.02em; white-space: nowrap; flex-shrink: 0;
        }
        .swap-item-action-btn:hover { background: var(--theme-accent-green); color: ${isDark ? "#030C06" : "#ffffff"}; }

        .swap-target-from {
          margin: 0 20px 0; padding: 10px 14px; border-radius: 10px;
          background: var(--theme-bg-secondary); border: 0.5px solid var(--theme-border);
          display: flex; align-items: center; gap: 10px;
        }
        .swap-target-from-label { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--theme-text-muted); flex-shrink: 0; font-family: 'DM Mono', monospace; }
        .swap-target-from-arrow { color: var(--theme-text-muted); opacity: 0.4; flex-shrink: 0; }
        .swap-target-from-hostname { font-size: 13px; font-weight: 600; color: var(--theme-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'DM Sans', sans-serif; }
        .swap-target-from-ip { font-size: 11px; font-family: 'DM Mono', monospace; color: var(--theme-text-muted); margin-left: auto; flex-shrink: 0; }

        .preconfig-route {
          margin: 0 20px; padding: 14px 16px; border-radius: 12px;
          background: var(--theme-bg-secondary); border: 0.5px solid var(--theme-border);
          display: flex; align-items: center; gap: 10px;
        }
        .preconfig-route-device { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .preconfig-route-tag { font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--theme-text-muted); font-family: 'DM Mono', monospace; }
        .preconfig-route-hostname { font-size: 13px; font-weight: 600; color: var(--theme-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'DM Sans', sans-serif; }
        .preconfig-route-ip { font-size: 11px; font-family: 'DM Mono', monospace; color: var(--theme-text-muted); }
        .preconfig-route-arrow {
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 8px;
          background: var(--theme-bg-card); border: 0.5px solid var(--theme-border);
          color: var(--theme-accent-green);
        }
        .preconfig-cmd-section { padding: 0 20px; }
        .preconfig-cmd-label { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--theme-text-muted); margin-bottom: 8px; font-family: 'DM Mono', monospace; }
        .preconfig-cmd-wrap { position: relative; border-radius: 10px; background: #0f1117; border: 0.5px solid rgba(255,255,255,0.08); overflow: hidden; }
        .preconfig-cmd-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-bottom: 0.5px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); }
        .preconfig-cmd-dots { display: flex; gap: 5px; }
        .preconfig-cmd-dot { width: 8px; height: 8px; border-radius: 50%; }
        .preconfig-cmd-copy { font-size: 10px; font-weight: 500; letter-spacing: 0.04em; font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.35); background: transparent; border: 0.5px solid rgba(255,255,255,0.12); border-radius: 5px; padding: 2px 9px; cursor: pointer; transition: all 0.15s ease; }
        .preconfig-cmd-copy:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.3); }
        .preconfig-cmd-body { padding: 14px 16px; font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.75; color: rgba(255,255,255,0.85); white-space: pre; overflow-x: auto; }
        .preconfig-cmd-body .cmd-kw { color: #7DD3AF; }
        .preconfig-cmd-body .cmd-val { color: #A5D6FA; }
        .preconfig-cmd-body .cmd-comment { color: rgba(255,255,255,0.3); }
        .preconfig-footer { padding: 14px 20px 20px; display: flex; justify-content: flex-end; gap: 8px; }
        .preconfig-close-btn { font-size: 12px; font-weight: 500; padding: 7px 18px; border-radius: 100px; border: 0.5px solid var(--theme-border); background: transparent; color: var(--theme-text-secondary); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s ease; }
        .preconfig-close-btn:hover { background: var(--theme-bg-secondary); color: var(--theme-text-primary); }
        .preconfig-apply-btn { font-size: 12px; font-weight: 600; padding: 7px 18px; border-radius: 100px; border: none; background: var(--theme-accent-green); color: ${isDark ? "#030C06" : "#ffffff"}; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s ease; letter-spacing: 0.02em; }
        .preconfig-apply-btn:hover { opacity: 0.85; }

        .swap-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 8px; color: var(--theme-text-muted); font-size: 13px; font-family: 'DM Sans', sans-serif; }

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

      {showSwapModal && (
        <div className="swap-overlay" onClick={() => setShowSwapModal(false)}>
          <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="swap-modal-header">
              <div className="swap-modal-title">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                className="swap-modal-close"
                onClick={() => setShowSwapModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="swap-search-wrap">
              <span className="swap-search-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                className="swap-search-input"
                placeholder="Search hostname..."
                value={swapQuery}
                onChange={(e) => setSwapQuery(e.target.value)}
              />
            </div>
            <div className="swap-divider" />
            <div className="swap-result-count">
              {swapFiltered.length} device{swapFiltered.length !== 1 ? "s" : ""}{" "}
              found
            </div>
            <div className="swap-list">
              {swapFiltered.length === 0 ? (
                <div className="swap-empty">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                swapFiltered.map((d, idx) => (
                  <div key={idx} className="swap-list-item">
                    <div className="swap-item-left">
                      <div className="swap-item-icon">
                        {d.type?.slice(0, 2).toUpperCase() ?? "—"}
                      </div>
                      <div>
                        <div className="swap-item-hostname">{d.hostname}</div>
                        <div className="swap-item-ip">{d.systemIp}</div>
                      </div>
                    </div>
                    <div className="swap-item-right">
                      <span className="swap-item-type">{d.type}</span>
                      <span
                        className={`status-badge ${d.reachable === "reachable" ? "up" : "down"}`}
                      >
                        <span
                          className={`status-dot ${d.reachable === "reachable" ? "up" : "down"}`}
                        />
                        {d.reachable === "reachable" ? "Up" : "Down"}
                      </span>
                      <button
                        className="swap-item-action-btn"
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
          className="swap-overlay"
          onClick={() => setShowSwapTargetModal(false)}
        >
          <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="swap-modal-header">
              <div className="swap-modal-title">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                className="swap-modal-close"
                onClick={() => setShowSwapTargetModal(false)}
              >
                ✕
              </button>
            </div>
            {selectedDevice && (
              <div style={{ padding: "12px 20px 0" }}>
                <div className="swap-target-from">
                  <span className="swap-target-from-label">From</span>
                  <span className="swap-target-from-arrow">→</span>
                  <span className="swap-target-from-hostname">
                    {selectedDevice.hostname}
                  </span>
                  <span className="swap-target-from-ip">
                    {selectedDevice.systemIp}
                  </span>
                  <span
                    className={`status-badge ${selectedDevice.reachable === "reachable" ? "up" : "down"}`}
                    style={{ flexShrink: 0 }}
                  >
                    <span
                      className={`status-dot ${selectedDevice.reachable === "reachable" ? "up" : "down"}`}
                    />
                    {selectedDevice.reachable === "reachable" ? "Up" : "Down"}
                  </span>
                </div>
              </div>
            )}
            <div className="swap-search-wrap">
              <span className="swap-search-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                className="swap-search-input"
                placeholder="Search replacement device..."
                value={swapTargetQuery}
                onChange={(e) => setSwapTargetQuery(e.target.value)}
              />
            </div>
            <div className="swap-divider" />
            <div className="swap-result-count">
              {swapTargetFiltered.length} device
              {swapTargetFiltered.length !== 1 ? "s" : ""} found
            </div>
            <div className="swap-list">
              {swapTargetFiltered.length === 0 ? (
                <div className="swap-empty">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <div key={idx} className="swap-list-item">
                    <div className="swap-item-left">
                      <div className="swap-item-icon">
                        {d.type?.slice(0, 2).toUpperCase() ?? "—"}
                      </div>
                      <div>
                        <div className="swap-item-hostname">{d.hostname}</div>
                        <div className="swap-item-ip">{d.systemIp}</div>
                      </div>
                    </div>
                    <div className="swap-item-right">
                      <span className="swap-item-type">{d.type}</span>
                      <span
                        className={`status-badge ${d.reachable === "reachable" ? "up" : "down"}`}
                      >
                        <span
                          className={`status-dot ${d.reachable === "reachable" ? "up" : "down"}`}
                        />
                        {d.reachable === "reachable" ? "Up" : "Down"}
                      </span>
                      <button
                        className="swap-item-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetDevice(d);
                          setShowSwapTargetModal(false);
                          setShowPreconfigModal(true);
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showPreconfigModal && selectedDevice && targetDevice && (
        <div
          className="swap-overlay"
          onClick={() => {
            setShowPreconfigModal(false);
            setSelectedDevice(null);
            setTargetDevice(null);
          }}
        >
          <div
            className="swap-modal"
            style={{ width: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="swap-modal-header">
              <div className="swap-modal-title">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                className="swap-modal-close"
                onClick={() => {
                  setShowPreconfigModal(false);
                  setSelectedDevice(null);
                  setTargetDevice(null);
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "14px 20px 0" }}>
              <div className="preconfig-route">
                <div className="preconfig-route-device">
                  <span className="preconfig-route-tag">From</span>
                  <span className="preconfig-route-hostname">
                    {selectedDevice.hostname}
                  </span>
                  <span className="preconfig-route-ip">
                    {selectedDevice.systemIp}
                  </span>
                </div>
                <div className="preconfig-route-arrow">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  className="preconfig-route-device"
                  style={{ textAlign: "right" }}
                >
                  <span className="preconfig-route-tag">To</span>
                  <span className="preconfig-route-hostname">
                    {targetDevice.hostname}
                  </span>
                  <span className="preconfig-route-ip">
                    {targetDevice.systemIp}
                  </span>
                </div>
              </div>
            </div>
            <div className="preconfig-cmd-section" style={{ marginTop: 14 }}>
              <div className="preconfig-cmd-label">Preconfigure Command</div>
              <div className="preconfig-cmd-wrap">
                <div className="preconfig-cmd-bar">
                  <div className="preconfig-cmd-dots">
                    <div
                      className="preconfig-cmd-dot"
                      style={{ background: "#FF5F57" }}
                    />
                    <div
                      className="preconfig-cmd-dot"
                      style={{ background: "#FFBD2E" }}
                    />
                    <div
                      className="preconfig-cmd-dot"
                      style={{ background: "#28CA41" }}
                    />
                  </div>
                  <button
                    className="preconfig-cmd-copy"
                    onClick={() => {
                      const cmd = `configure\nsystem\n  host-name     ${targetDevice.hostname}\n  system-ip     ${targetDevice.systemIp}\n  site-id       ${targetDevice.siteId}\n!\nrequest device swap\n  from-host     ${selectedDevice.hostname}\n  from-ip       ${selectedDevice.systemIp}\n  to-host       ${targetDevice.hostname}\n  to-ip         ${targetDevice.systemIp}\n!`;
                      navigator.clipboard.writeText(cmd);
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="preconfig-cmd-body">
                  <span className="cmd-comment">{`! Preconfigure — ${new Date().toISOString().slice(0, 10)}\n`}</span>
                  <span className="cmd-kw">configure{`\n`}</span>
                  <span className="cmd-kw">system{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">host-name</span>
                  <span>{`     `}</span>
                  <span className="cmd-val">{targetDevice.hostname}</span>
                  <span>{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">system-ip</span>
                  <span>{`     `}</span>
                  <span className="cmd-val">{targetDevice.systemIp}</span>
                  <span>{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">site-id</span>
                  <span>{`       `}</span>
                  <span className="cmd-val">{targetDevice.siteId}</span>
                  <span>{`\n`}</span>
                  <span className="cmd-kw">!</span>
                  <span>{`\n`}</span>
                  <span className="cmd-kw">request device swap</span>
                  <span>{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">from-host</span>
                  <span>{`     `}</span>
                  <span className="cmd-val">{selectedDevice.hostname}</span>
                  <span>{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">from-ip</span>
                  <span>{`       `}</span>
                  <span className="cmd-val">{selectedDevice.systemIp}</span>
                  <span>{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">to-host</span>
                  <span>{`       `}</span>
                  <span className="cmd-val">{targetDevice.hostname}</span>
                  <span>{`\n`}</span>
                  <span>{`  `}</span>
                  <span className="cmd-kw">to-ip</span>
                  <span>{`         `}</span>
                  <span className="cmd-val">{targetDevice.systemIp}</span>
                  <span>{`\n`}</span>
                  <span className="cmd-kw">!</span>
                </div>
              </div>
            </div>
            <div className="preconfig-footer">
              <button
                className="preconfig-close-btn"
                onClick={() => {
                  setShowPreconfigModal(false);
                  setSelectedDevice(null);
                  setTargetDevice(null);
                }}
              >
                Cancel
              </button>
              <button
                className="preconfig-apply-btn"
                onClick={() => {
                  setShowPreconfigModal(false);
                  setSelectedDevice(null);
                  setTargetDevice(null);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="db-root">
        <div className="metric-grid">
          {[
            {
              label: "Total Devices",
              value: total,
              color: "var(--theme-text-primary)",
              bar: "var(--theme-border)",
              icon: "DEV",
              sub: "monitored",
              cls: "anim-0",
            },
            {
              label: "Reachable",
              value: reach,
              color: accentGreen,
              bar: `linear-gradient(90deg,${accentGreen},${isDark ? "#00FFCC" : "#5DCAA5"})`,
              icon: "UP",
              sub: "online now",
              cls: "anim-1",
            },
            {
              label: "Unreachable",
              value: unreach,
              color: accentRed,
              bar: `linear-gradient(90deg,${accentRed},${isDark ? "#FF8866" : "#F09595"})`,
              icon: "DN",
              sub: "offline",
              cls: "anim-2",
            },
            {
              label: "Sites",
              value: sites,
              color: "var(--theme-text-primary)",
              bar: "linear-gradient(90deg,#7F77DD,#AFA9EC)",
              icon: "LOC",
              sub: "locations",
              cls: "anim-3",
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`metric-card ${m.cls}`}
              style={gridStyle}
            >
              <div className="accent-bar" style={{ background: m.bar }} />
              <div className="m-label">{m.label}</div>
              <div className="m-value" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="m-sub">{m.sub}</div>
              <div className="m-icon">{m.icon}</div>
            </div>
          ))}
        </div>

        <div className="wan-grid">
          <div className="panel anim-panel-1" style={gridStyle}>
            <div className="panel-title">WAN Edge Health</div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div className="donut-wrap">
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
                <div className="donut-center">
                  <div className="donut-num">{total}</div>
                  <div className="donut-sub">WAN Edges</div>
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
                  <div key={l.label} className="legend-item">
                    <span className={`legend-dot ${l.colorClass}`} />
                    <span>{l.label}</span>
                    <span className="legend-count">{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel anim-panel-2" style={gridStyle}>
            <div className="panel-title">Site BFD Connectivity ({sites})</div>
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
              <div key={row.label} className="bfd-row">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    className="bfd-pill"
                    style={{
                      background: row.bg,
                      color: row.color,
                      border: `1px solid ${row.color}22`,
                    }}
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

        <div className="panel anim-table" style={gridStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div className="panel-title" style={{ margin: 0, flex: 1 }}>
              Device List
            </div>
            <div className="filter-bar">
              <button
                className="swap-btn"
                onClick={() => setShowSwapModal(true)}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                  {[
                    "Hostname",
                    "System IP",
                    "Site ID",
                    "Type",
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
                      colSpan={7}
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
                      <td className="mono">{d.systemIp}</td>
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
                      <td className={cn("mono", !d.ge01 && "muted")}>
                        {d.ge01 ?? "—"}
                      </td>
                      <td className={cn("mono", !d.ge02 && "muted")}>
                        {d.ge02 ?? "—"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${d.reachable === "reachable" ? "up" : "down"}`}
                        >
                          <span
                            className={`status-dot ${d.reachable === "reachable" ? "up" : "down"}`}
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
  const [isDark, setIsDark] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

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
        {
          ip: credentials.ip,
          cookie: authenResponse.data.cookie,
        },
      );

      if (deviceResponse.status === 200) {
        setShowModal(false);
        setConnectionError(false);
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
              } else {
              }
            } else {
            }
          } catch (error) {
            console.error(
              `Device ${i} (${deviceIds[i]}) getInterfaces failed`,
              error,
            );
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
          <DeviceDashboard devices={devices} isDark={isDark} />
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
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid var(--theme-border)",
                borderTop: "2px solid var(--theme-accent-green)",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--theme-text-muted)",
              }}
            >
              Awaiting Connection...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
