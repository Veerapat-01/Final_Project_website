"use client";

import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

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

        .hero-title span {
          color: #e8601f;
        }

        .hero-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          max-width: 380px;
          font-weight: 400;
          margin-bottom: 36px;
        }

        .stats-row {
          display: flex;
          gap: 0;
        }

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

        .form-header {
          margin-bottom: 36px;
        }

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

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3d4a5c;
          margin-bottom: 7px;
          letter-spacing: 0.1px;
        }

        .input-wrap {
          position: relative;
        }

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

        .form-input.has-icon {
          padding-right: 44px;
        }

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

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #eaecf0;
        }

        .divider-text {
          font-size: 12px;
          color: #b0bac8;
          font-weight: 400;
        }

        .sso-btn {
          width: 100%;
          height: 46px;
          background: #fff;
          color: #3d4a5c;
          font-size: 14px;
          font-weight: 500;
          border: 1.5px solid #dde3ec;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: border-color 0.18s, background 0.18s;
        }

        .sso-btn:hover { background: #f8f9fb; border-color: #c8d0dc; }

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

      {/* Left panel — building bg */}
      <div className="left-panel">
        <img className="left-bg-img" src="/building.jpg" alt="AIT office building" />
        <div className="left-overlay" />

        <div className="logo-area">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 36 36">
              <ellipse cx="15" cy="18" rx="7" ry="10" fill="none" stroke="#fff" strokeWidth="2.5" />
              <ellipse cx="21" cy="18" rx="7" ry="10" fill="#fff" opacity="0.9" />
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

          {/* <h1 className="hero-title">
            Replace Failed<br />
            Routers <span>Automatically</span>
          </h1> */}
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
              <ellipse cx="15" cy="18" rx="7" ry="10" fill="none" stroke="#fff" strokeWidth="3" />
              <ellipse cx="21" cy="18" rx="7" ry="10" fill="#fff" opacity="0.9" />
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <a className="forgot-link">Forgot password?</a>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <><div className="spinner" /> Signing in...</>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">or continue with</span>
          <div className="divider-line" />
        </div>

        <button className="sso-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d4a5c" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Sign in with SSO
        </button>
      </div>
    </div>
  );
}