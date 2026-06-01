"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { Reminders } from "@/components/dashboard/reminders"
import { ProjectList } from "@/components/dashboard/project-list"
import { TeamCollaboration } from "@/components/dashboard/team-collaboration"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { MobileAppCard } from "@/components/dashboard/mobile-app-card"
import { TimeTracker } from "@/components/dashboard/time-tracker"
import { VManageConnectionModal } from "@/components/dashboard/vmanage-connection-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ─────────────────────────── skeleton helper ─────────────────────────── */

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/60 animate-pulse",
        className
      )}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="hidden sm:flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-card">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* left col */}
        <div className="lg:col-span-2 space-y-4">
          {/* chart card */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-44 w-full rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 flex-1" />
            </div>
          </div>

          {/* team card */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-3">
            <Skeleton className="h-4 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* right col */}
        <div className="space-y-4">
          {/* reminders */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-3">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>

          {/* progress */}
          <div className="rounded-xl border border-border p-4 bg-card space-y-3">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 bg-card space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Show skeleton first, then popup modal after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 700)
    return () => clearTimeout(timer)
  }, [])

  const handleConnect = (credentials: {
    ip: string
    username: string
    password: string
  }) => {
    console.log("Connecting to vManage at:", credentials.ip)
    // TODO: Store credentials / call your vManage API here
    setShowModal(false)
    setIsConnected(true)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* vManage popup */}
      {showModal && <VManageConnectionModal onConnect={handleConnect} />}

      {/* sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* main */}
      <main
        className={cn(
          "flex-1 p-4 md:p-5 lg:p-6 transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        {isConnected ? (
          /* ── real dashboard ── */
          <>
            <Header
              title="Campaign Dashboard"
              description="Plan, execute, and optimize your marketing campaigns with data-driven insights."
              actions={
                <>
                  <Button className="w-full sm:w-auto h-9 px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                    + New Campaign
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-9 px-4 text-sm font-medium rounded-lg bg-transparent"
                  >
                    Export Report
                  </Button>
                </>
              }
            />

            <div className="mt-4 md:mt-5 space-y-4">
              <StatsCards />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <ProjectAnalytics />
                  <TeamCollaboration />
                </div>
                <div className="space-y-4">
                  <Reminders />
                  <ProjectProgress />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProjectList />
                <MobileAppCard />
                <TimeTracker />
              </div>
            </div>
          </>
        ) : (
          /* ── skeleton while waiting for credentials ── */
          <DashboardSkeleton />
        )}
      </main>
    </div>
  )
}