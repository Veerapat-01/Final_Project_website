"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { encrypt } from "./encrypt";

/* ── Toast state type ── */
type ToastType = "success" | "error" | null;

function Toast({ type, onClose }: { type: ToastType; onClose: () => void }) {
  if (!type) return null;

  const isSuccess = type === "success";

  return (
    <div className="toast-backdrop" onClick={onClose}>
      <div
        className={`toast-card ${isSuccess ? "toast-success" : "toast-error"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="toast-glow" />

        {/* Icon */}
        <div
          className={`toast-icon-wrap ${isSuccess ? "icon-success" : "icon-error"}`}
        >
          {isSuccess ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="toast-text">
          <div className="toast-title">
            {isSuccess ? "Login successful" : "Login failed"}
          </div>
          <div className="toast-sub">
            {isSuccess
              ? "Welcome back! Redirecting you now…"
              : "Invalid email or password. Please try again."}
          </div>
        </div>

        {/* Close button */}
        <button className="toast-close" onClick={onClose} aria-label="Close">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Auto-dismiss progress bar */}
        <div
          className={`toast-progress ${isSuccess ? "progress-success" : "progress-error"}`}
        />
      </div>
    </div>
  );
}

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast] = useState<ToastType>(null);
  const router = useRouter();

  function closeToast() {
    setToast(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/POST/getlogin",
        { email, password },
      );
      if (response.status === 200 && response.data.success) {
        setToast("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setToast("error");
      }
    } catch (error) {
      setToast("error");
    } finally {
      setLoading(false);
    }

    /* Auto-dismiss error after 4s */
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="min-h-screen flex">

      {/* ── TOAST ── */}
      <Toast type={toast} onClose={closeToast} />

      {/* Left panel — building bg */}
      <div className="left-panel">
        <img
          className="left-bg-img"
          src="/building.jpg"
          alt="AIT office building"
        />
        <div className="left-overlay" />

        <div className="logo-area">
          <div 
            className="logo-icon" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(8px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px', 
              padding: '6px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Image 
              src="/ait.png" 
              alt="AIT Logo" 
              width={28} 
              height={28} 
              className="object-contain drop-shadow-sm brightness-110" 
            />
          </div>
          <div>
            <div className="logo-text-main">AIT</div>
            <div className="logo-text-sub">PROFESSIONAL ICT SOLUTIONS</div>
          </div>
        </div>

        <div className="hero-content">
          <div className="badge">
            <div className="badge-dot" />
            <span className="badge-text">SD-WAN AUTOMATED RECOVERY CENTRE</span>
          </div>

          <h1 className="hero-title">
            AIT <span>ARC</span>
          </h1>

          <p className="hero-desc">
            Reconfigure replacement routers from failed devices —<br />
            zero-touch, no on-site engineer required.
          </p>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime SLA</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">&lt;15 min</div>
              <div className="stat-label">Recovery Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Zero-touch</div>
              <div className="stat-label">Provisioning</div>
            </div>
          </div>
        </div>

        <div className="footer-bar">
          <div 
            className="logo-icon" 
            style={{ 
              width: 24, 
              height: 24, 
              background: 'rgba(255, 255, 255, 0.15)', 
              borderRadius: '6px', 
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image 
              src="/ait.png" 
              alt="AIT Logo" 
              width={16} 
              height={16} 
              className="object-contain drop-shadow-sm brightness-110 opacity-90" 
            />
          </div>
          <span className="footer-text">AIT Professional ICT Solutions</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="right-panel">
        <div className="form-header">
          <div className="form-title">Welcome back</div>
          <div className="form-subtitle">Sign in to your AIT ARC account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="input-wrap">
              <input
                className="form-input"
                type="email"
                placeholder="you@ait.co.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input
                className="form-input has-icon"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
