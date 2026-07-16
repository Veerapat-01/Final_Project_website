"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { decrypt } from "@/app/encrypt";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import styles from "./security.module.css";

// ─── Types ────────────────────────────────────────────────
type Role = "Admin" | "Operator" | "Suspended";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLogin: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────
const ROLE_META: Record<Role, { desc: string; icon: string }> = {
  Admin: {
    desc: "Full access to all features and user management",
    icon: "🛡️",
  },
  Operator: { desc: "Can view and manage network devices", icon: "⚙️" },
  Suspended: { desc: "Account disabled, no access", icon: "🚫" },
};

const AVATAR_COLORS = [
  styles.avatarPurple,
  styles.avatarGreen,
  styles.avatarAmber,
  styles.avatarRed,
  styles.avatarBlue,
  styles.avatarPink,
];

const ROLE_BADGE: Record<Role, string> = {
  Admin: styles.roleAdmin,
  Operator: styles.roleOperator,
  Suspended: styles.roleAuditor,
};

const ROLE_ICON: Record<Role, string> = {
  Admin: styles.roleIconAdmin,
  Operator: styles.roleIconOperator,
  Suspended: styles.roleIconAuditor,
};

type ActivityEntry = {
  type: "add" | "delete" | "edit";
  text: string;
  time: string;
};

// ─── Helpers ──────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  const idx = id.charCodeAt(1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function nowStr(): string {
  return "Just now";
}

// ─── Main Component ───────────────────────────────────────
function AuthErrorModal({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        animation: "authFadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "var(--theme-bg-card, #fff)",
          padding: "32px",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          border: "1px solid var(--theme-accent-red, #E24B4A)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(226,75,74,0.1)",
            color: "var(--theme-accent-red, #E24B4A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "28px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2
          style={{
            margin: "0 0 12px",
            color: "var(--theme-text-primary, #000)",
            fontSize: "20px",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Access Denied
        </h2>
        <p
          style={{
            margin: 0,
            color: "var(--theme-text-secondary, #666)",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          {message}
        </p>
        <div
          style={{
            marginTop: "24px",
            width: "100%",
            height: "4px",
            background: "rgba(226,75,74,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--theme-accent-red, #E24B4A)",
              animation: "authShrink 3s linear forwards",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes authFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes authShrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}

function SecurityContent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_URL || ""}/api/GET/alllogin`)
      .then((res) => {
        const fetchedUsers = res.data.map((d: any) => {
          let role = d.roles || d.staff_dept || "Operator";
          role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
          if (!["Admin", "Operator", "Suspended"].includes(role)) {
            role = "Operator";
          }
          return {
            id: d.staff_id || "u" + Math.random(),
            name: `${d.staff_fname || ""} ${d.staff_lname || ""}`.trim(),
            email: d.staff_email,
            role: role as Role,
            lastLogin: "—",
            createdAt: "—",
          };
        });
        setUsers(fetchedUsers);
      })
      .catch(console.error);
  }, []);

  const router = useRouter();
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    axios
      .get("/api/GET/me", { withCredentials: true })
      .then((response) => {
        if (response.status === 200 && response.data.user) {
          const data = response.data.user;
          const userRole = (
            data.role ||
            data.roles ||
            data.staff_role ||
            data["staff dept"] ||
            ""
          ).toLowerCase();

          if (userRole === "suspend" || userRole === "suspended") {
            setAuthError("Your account has been suspended. Please contact support.");
            setTimeout(() => router.push("/"), 3000);
            return;
          }

          if (userRole !== "admin") {
            setAuthError("Access Denied. Security center is restricted to Administrators.");
            setTimeout(() => router.push("/dashboard"), 3000);
            return;
          }

          // Successfully authenticated
        } else {
          setAuthError(`Auth Failed: Missing user data in response. Status: ${response.status}`);
          setTimeout(() => router.push("/"), 3000);
        }
      })
      .catch((error) => {
        console.error("Auth error", error);
        setAuthError(`Authentication error: ${error.response?.data?.error || error.message}. Redirecting to login...`);
        setTimeout(() => router.push("/"), 3000);
      });
  }, [router]);

  // ── Reset dark theme set by dashboard ──
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    // Reset any CSS vars set by the dashboard dark theme
    const darkVars = [
      "--theme-bg-base",
      "--theme-bg-primary",
      "--theme-bg-secondary",
      "--theme-bg-card",
      "--theme-bg-glass",
      "--theme-border",
      "--theme-border-strong",
      "--theme-text-primary",
      "--theme-text-secondary",
      "--theme-text-muted",
      "--theme-accent-green",
      "--theme-accent-red",
      "--theme-accent-light",
      "--theme-accent-glow",
      "--theme-glow-ring-green",
      "--theme-glow-ring-red",
      "--color-background-primary",
      "--color-background-secondary",
      "--color-text-primary",
      "--color-text-secondary",
      "--color-border-tertiary",
    ];
    const prevBg = root.style.background;
    const prevBodyBg = body.style.background;
    root.style.background = "";
    body.style.background = "#f5f6fa";
    body.style.transition = "background 0.3s ease";
    darkVars.forEach((v) => root.style.removeProperty(v));
    return () => {
      // Restore on unmount (dashboard will re-apply its own vars)
      root.style.background = prevBg;
      body.style.background = prevBodyBg;
    };
  }, []);

  // Add / Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete modal
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Operator" as Role,
  });
  const [formError, setFormError] = useState("");

  // ── Filtered users ──
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.role !== "Suspended").length;
    const admins = users.filter((u) => u.role === "Admin").length;
    const inactive = users.filter((u) => u.role === "Suspended").length;
    return { total, active, admins, inactive };
  }, [users]);

  // ── Role counts ──
  const roleCounts = useMemo(() => {
    const counts: Record<Role, number> = {
      Admin: 0,
      Operator: 0,
      Suspended: 0,
    };
    users.forEach((u) => counts[u.role]++);
    return counts;
  }, [users]);

  // ── Open Add Modal ──
  function openAdd() {
    setEditingUser(null);
    setForm({ name: "", email: "", role: "Operator" });
    setFormError("");
    setShowAddModal(true);
  }

  // ── Open Edit Modal ──
  function openEdit(user: User) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setFormError("");
    setShowAddModal(true);
  }

  // ── Save user ──
  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setFormError("Valid email is required.");
      return;
    }
    setFormError("");

    try {
      if (editingUser) {
        await axios.post(`${process.env.NEXT_PUBLIC_URL || ""}/api/POST/updateuser`, {
          email: form.email,
          role: form.role,
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...form } : u)),
        );
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_URL || ""}/api/POST/adduser`, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
        const newUser: User = {
          id: "u" + Date.now(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          lastLogin: "—",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setUsers((prev) => [newUser, ...prev]);
      }
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(
        err.response?.data?.error || err.message || "An error occurred",
      );
    }
  }

  // ── Confirm delete ──
  async function handleDelete() {
    if (!deletingUser) return;
    try {
      const res = await axios.delete("/api/DELETE/deleteuser", {
        data: { id: deletingUser.id, email: deletingUser.email },
        withCredentials: true
      });
      if (res.status === 200) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      } else {
        alert("Failed to delete user");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting user");
    } finally {
      setDeletingUser(null);
    }
  }

  if (authError) {
    return <AuthErrorModal message={authError} />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f5f6fa" }}>

      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      <main
        className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        <div className={styles.pageInner}>
          {/* ── Page Header ── */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.pageEyebrow}>
                <span className={styles.eyebrowDot} />
                <span className={styles.eyebrowText}>Security Centre</span>
              </div>
              <h1 className={styles.pageTitle}>User Management</h1>
              <p className={styles.pageSubtitle}>
                Manage access, roles and permissions for your team
              </p>
            </div>
            <button
              className={styles.addUserBtn}
              onClick={openAdd}
              id="add-user-btn"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add User
            </button>
          </div>

          {/* ── Stats ── */}
          <div className={styles.statsGrid}>
            {[
              {
                label: "Total Users",
                value: stats.total,
                sub: "registered accounts",
                color: "purple",
              },
              {
                label: "Active",
                value: stats.active,
                sub: "currently active",
                color: "green",
              },
              {
                label: "Admins",
                value: stats.admins,
                sub: "with full access",
                color: "amber",
              },
              {
                label: "Inactive",
                value: stats.inactive,
                sub: "suspended / idle",
                color: "red",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(styles.statCard, (styles as any)[s.color])}
              >
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Main Content ── */}
          <div className={styles.contentGrid}>
            {/* LEFT: User Table */}
            <div className={styles.panel}>
              {/* Panel header */}
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="6"
                      cy="5"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M1 14c0-3 2-5 5-5h2c3 0 5 2 5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  All Users
                  <span className={styles.panelCount}>
                    {filteredUsers.length}
                  </span>
                </div>
                <div className={styles.filterTabs}>
                  {(["All", "Admin", "Operator", "Suspended"] as const).map(
                    (r) => (
                      <button
                        key={r}
                        className={cn(
                          styles.filterTab,
                          roleFilter === r && styles.active,
                        )}
                        onClick={() => setRoleFilter(r)}
                      >
                        {r}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Search */}
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
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
                  className={styles.searchInput}
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Table */}
              {filteredUsers.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    opacity="0.3"
                  >
                    <circle
                      cx="10"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M2 21v-1a8 8 0 0112.596-6.566"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="19"
                      cy="19"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M19 17v2.5M19 21v.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>No users found</span>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Last Login</th>
                        <th>Created</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className={styles.fadeIn}>
                          <td>
                            <div className={styles.userCell}>
                              <div
                                className={cn(
                                  styles.avatar,
                                  getAvatarColor(u.id),
                                )}
                              >
                                {getInitials(u.name)}
                              </div>
                              <div>
                                <div className={styles.userName}>{u.name}</div>
                                <div className={styles.userEmail}>
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={cn(
                                styles.roleBadge,
                                ROLE_BADGE[u.role],
                              )}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className={styles.monoCell}>{u.lastLogin}</td>
                          <td className={styles.monoCell}>{u.createdAt}</td>
                          <td>
                            <div
                              className={styles.actionBtns}
                              style={{ justifyContent: "flex-end" }}
                            >
                              <button
                                className={styles.editBtn}
                                title="Edit user"
                                onClick={() => openEdit(u)}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                              <button
                                className={styles.deleteBtn}
                                title="Delete user"
                                onClick={() => setDeletingUser(u)}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M3 5h10M6 5V3h4v2M13 5l-1 8H4L3 5"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT: Roles + Activity */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Role Summary */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 1l2 4h4l-3.2 2.4 1.2 4L8 9 4 11.4l1.2-4L2 5h4z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Roles & Permissions
                  </div>
                </div>
                {(["Admin", "Operator", "Suspended"] as Role[]).map((role) => (
                  <div key={role} className={styles.roleCard}>
                    <div className={cn(styles.roleIcon, ROLE_ICON[role])}>
                      <span style={{ fontSize: "15px" }}>
                        {ROLE_META[role].icon}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.roleCardName}>{role}</div>
                      <div className={styles.roleCardDesc}>
                        {ROLE_META[role].desc}
                      </div>
                    </div>
                    <div className={styles.roleCardCount}>
                      {roleCounts[role]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Add / Edit User Modal ── */}
      {showAddModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Name */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Full Name</label>
                <input
                  className={styles.modalInput}
                  placeholder="e.g. Veerapat Supaporn"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              {/* Email */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Email Address</label>
                <input
                  className={styles.modalInput}
                  type="email"
                  placeholder="e.g. user@ait.ac.th"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>

              {/* Role */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Role</label>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.modalSelect}
                    value={form.role}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, role: e.target.value as Role }))
                    }
                  >
                    <option value="Admin">Admin — Full access</option>
                    <option value="Operator">
                      Operator — Device management
                    </option>
                    <option value="Suspended">
                      Suspended — Account disabled
                    </option>
                  </select>
                  <span className={styles.selectCaret}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 4l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Role info hint */}
              {form.role && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#ede9fe",
                    border: "1px solid #ddd6fe",
                    fontSize: "12px",
                    color: "#4338ca",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#818cf8" }}>{form.role}:</strong>{" "}
                  {ROLE_META[form.role].desc}
                </div>
              )}

              {/* Error */}
              {formError && (
                <div
                  style={{
                    color: "#f87171",
                    fontSize: "12px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  ⚠ {formError}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!form.name || !form.email}
              >
                {editingUser ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingUser && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeletingUser(null)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Delete</h2>
              <button
                className={styles.modalClose}
                onClick={() => setDeletingUser(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.deleteModalBody}>
              <div className={styles.deleteIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                    stroke="#f87171"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 11v6M14 11v6"
                    stroke="#f87171"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className={styles.deleteConfirmText}>
                Are you sure you want to remove{" "}
                <strong>{deletingUser.name}</strong> ({deletingUser.email})?
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.deleteConfirmFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={handleDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "#f5f6fa",
          }}
        >
          Loading security...
        </div>
      }
    >
      <SecurityContent />
    </Suspense>
  );
}
