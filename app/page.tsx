"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
        `${process.env.NEXT_PUBLIC_URL}/api/POST/getlogin`,
        { email, password },
      );
      if (response.status === 200) {
        const data = response.data[0];
        if (data.staff_email === email && data.staff_password === password) {
          setToast("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setToast("error");
        }
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
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─────────────────────────────────────────
           TOAST
        ───────────────────────────────────────── */
        .toast-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 32px;
          pointer-events: none;
        }

        .toast-card {
          pointer-events: all;
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 360px;
          max-width: 440px;
          padding: 20px 20px 28px 20px;
          border-radius: 18px;
          overflow: hidden;
          animation: toastIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          box-shadow:
            0 24px 64px rgba(0,0,0,0.18),
            0 8px 24px rgba(0,0,0,0.12),
            0 0 0 1px rgba(255,255,255,0.12) inset;
        }

        .toast-success {
          background: linear-gradient(135deg, #0a2318 0%, #0d2e1e 60%, #0f3823 100%);
          border: 1px solid rgba(29,158,117,0.35);
        }

        .toast-error {
          background: linear-gradient(135deg, #2a0a0a 0%, #2e0d0d 60%, #381010 100%);
          border: 1px solid rgba(226,75,74,0.35);
        }

        .toast-glow {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 80px;
          border-radius: 50%;
          filter: blur(32px);
          pointer-events: none;
          z-index: 0;
        }

        .toast-success .toast-glow {
          background: rgba(29,158,117,0.25);
        }

        .toast-error .toast-glow {
          background: rgba(226,75,74,0.25);
        }

        .toast-icon-wrap {
          position: relative;
          z-index: 1;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-success {
          background: rgba(29,158,117,0.18);
          color: #1D9E75;
          border: 1px solid rgba(29,158,117,0.3);
        }

        .icon-error {
          background: rgba(226,75,74,0.18);
          color: #E24B4A;
          border: 1px solid rgba(226,75,74,0.3);
        }

        .toast-text {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .toast-title {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 3px;
          letter-spacing: -0.1px;
        }

        .toast-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.5;
          font-weight: 400;
        }

        .toast-close {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
          align-self: flex-start;
          transition: background 0.15s, color 0.15s;
        }

        .toast-close:hover {
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8);
        }

        /* Progress bar at bottom */
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          border-radius: 0 0 18px 18px;
          animation: progressShrink 4s linear forwards;
        }

        .progress-success {
          background: linear-gradient(90deg, #1D9E75, #5DCAA5);
          animation-duration: 2s;
        }

        .progress-error {
          background: linear-gradient(90deg, #E24B4A, #F09595);
          animation-duration: 4s;
        }

        @keyframes progressShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ─────────────────────────────────────────
           ORIGINAL PAGE STYLES (unchanged)
        ───────────────────────────────────────── */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 56px;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }

        .left-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          z-index: 0;
        }

        .left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(8, 18, 36, 0.88) 0%,
            rgba(8, 18, 36, 0.72) 40%,
            rgba(8, 18, 36, 0.55) 100%
          );
          z-index: 1;
        }

        .right-panel {
          width: 500px;
          flex-shrink: 0;
          background: #f8f9fb;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 64px;
          border-left: 1px solid #eaecf0;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 2;
        }

        .logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #e8601f;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-text-main {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .logo-text-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.55);
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-top: -2px;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(232,96,31,0.18);
          border: 1px solid rgba(232,96,31,0.45);
          border-radius: 20px;
          padding: 5px 13px;
          margin-bottom: 20px;
          width: fit-content;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e8601f;
        }

        .badge-text {
          font-size: 11px;
          font-weight: 600;
          color: #ffb38a;
          letter-spacing: 0.6px;
        }

        .hero-title {
          font-size: 46px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
        }

        .hero-title span { color: #e8601f; }

        .hero-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          max-width: 380px;
          font-weight: 400;
          margin-bottom: 36px;
        }

        .stats-row { display: flex; gap: 0; }

        .stat-item {
          padding-right: 28px;
          margin-right: 28px;
          border-right: 1px solid rgba(255,255,255,0.15);
        }

        .stat-item:last-child {
          border-right: none;
          margin-right: 0;
          padding-right: 0;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
          font-weight: 400;
        }

        .footer-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          position: relative;
          z-index: 2;
        }

        .footer-text {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .form-header { margin-bottom: 36px; }

        .form-title {
          font-size: 26px;
          font-weight: 700;
          color: #0f1c2e;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #8a96a8;
          font-weight: 400;
        }

        .form-group { margin-bottom: 18px; }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3d4a5c;
          margin-bottom: 7px;
          letter-spacing: 0.1px;
        }

        .input-wrap { position: relative; }

        .form-input {
          width: 100%;
          height: 46px;
          border: 1.5px solid #dde3ec;
          border-radius: 10px;
          background: #fff;
          font-size: 14px;
          color: #0f1c2e;
          padding: 0 16px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .form-input:focus {
          border-color: #e8601f;
          box-shadow: 0 0 0 3px rgba(232,96,31,0.1);
        }

        .form-input.has-icon { padding-right: 44px; }

        .input-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #9ba8bb;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .forgot-link {
          display: block;
          text-align: right;
          font-size: 12px;
          color: #e8601f;
          font-weight: 500;
          margin-top: 8px;
          text-decoration: none;
          cursor: pointer;
        }

        .forgot-link:hover { text-decoration: underline; }

        .submit-btn {
          width: 100%;
          height: 48px;
          background: #e8601f;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.2px;
          margin-top: 8px;
          transition: background 0.18s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover { background: #d0541a; }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; padding: 40px 28px; }
        }
      `}</style>

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
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 36 36">
              <ellipse
                cx="15"
                cy="18"
                rx="7"
                ry="10"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
              />
              <ellipse
                cx="21"
                cy="18"
                rx="7"
                ry="10"
                fill="#fff"
                opacity="0.9"
              />
            </svg>
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
          <div className="logo-icon" style={{ width: 20, height: 20 }}>
            <svg width="12" height="12" viewBox="0 0 36 36">
              <ellipse
                cx="15"
                cy="18"
                rx="7"
                ry="10"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              />
              <ellipse
                cx="21"
                cy="18"
                rx="7"
                ry="10"
                fill="#fff"
                opacity="0.9"
              />
            </svg>
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
