"use client"

import { useState } from "react"
import { Eye, EyeOff, Server, PlugZap, Lock, AlertCircle, X } from "lucide-react"

interface Credentials {
  ip: string
  username: string
  password: string
}

interface VManageConnectionModalProps {
  onConnect: (credentials: Credentials) => void
  onClose?: () => void
}

export function VManageConnectionModal({ onConnect, onClose }: VManageConnectionModalProps) {
  const [ip, setIp] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof Credentials, string>>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Partial<Record<keyof Credentials, string>> = {}
    if (!ip.trim()) {
      newErrors.ip = "IP address is required"
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim())) {
      newErrors.ip = "Invalid IP format"
    }
    if (!username.trim()) newErrors.username = "Username is required"
    if (!password) newErrors.password = "Password is required"
    return newErrors
  }

  const handleConnect = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    // TODO: Replace with actual vManage authentication call
    // e.g. await fetch(`https://${ip}/j_security_check`, { method: 'POST', ... })
    await new Promise((r) => setTimeout(r, 1000))
    onConnect({ ip: ip.trim(), username: username.trim(), password })
  }

  const clearError = (field: keyof Credentials) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
          <Server className="w-5 h-5 text-blue-500" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-1">Connect to vManage</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Enter your vManage controller details to load the dashboard.
        </p>

        {/* IP Address */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
            IP Address
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => { setIp(e.target.value); clearError("ip") }}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="192.168.1.1"
            spellCheck={false}
            autoComplete="off"
            className={`w-full h-10 px-3 rounded-lg border bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              ${errors.ip ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-border"}`}
          />
          {errors.ip && (
            <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.ip}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearError("username") }}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            placeholder="admin"
            autoComplete="username"
            className={`w-full h-10 px-3 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              ${errors.username ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-border"}`}
          />
          {errors.username && (
            <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.username}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError("password") }}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`w-full h-10 px-3 pr-10 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                ${errors.password ? "border-destructive focus:ring-destructive/30 focus:border-destructive" : "border-border"}`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <PlugZap className="w-4 h-4" />
              Connect
            </>
          )}
        </button>

        {/* Footer */}
        <p className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          Connection secured via HTTPS
        </p>
      </div>
    </div>
  )
}