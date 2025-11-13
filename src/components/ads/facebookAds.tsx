"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Zap, Settings, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { getAdAccounts } from "@/src/utils/facebookAds"
import CampaignsAdSetsTable from "@/src/components/ads/CampaignsAdSetsTable"

interface AdAccount {
  id: string
  name: string
  status: "active" | "paused"
  spend: number
}

interface LogEntry {
  id: number
  message: string
  timestamp: string
  type: "success" | "error" | "info"
}

export default function FacebookAdsManager() {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      message: "System ready",
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [logCounter, setLogCounter] = useState(2)

  const addLog = (message: string, type: "success" | "error" | "info" = "info") => {
    const newLog: LogEntry = {
      id: logCounter,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type,
    }
    setLogs((prev) => [newLog, ...prev].slice(0, 20))
    setLogCounter((prev) => prev + 1)
  }



  const handleCreateCampaign = () => {
    addLog("Navigating to campaign creation...", "info")
  }

  const navItems = [
    {
      href: "/create-campaign",
      label: "Create Campaign",
      icon: Plus,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      onClick: handleCreateCampaign,
    },
    {
      href: "/create-ad-set",
      label: "Create Ad Set",
      icon: Zap,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      href: "/create-creative",
      label: "Create Creative",
      icon: Settings,
      color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    },
    {
      href: "/create-ad",
      label: "Create Ad",
      icon: Plus,
      color: "bg-red-50 text-red-600 hover:bg-red-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ads Manager</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your advertising campaigns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        onClick={item.onClick}
                        className={`w-full p-4 rounded-lg border border-gray-200 transition-all hover:border-gray-300 ${item.color} flex items-center justify-between group`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </Link>
                  )
                })}
              </div>
            </div>         

            {/* Campaigns and Ad Sets Table */}
            <CampaignsAdSetsTable />
          </div>

          {/* Sidebar - Logs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Activity Log</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="text-xs">
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5  ${
                            log.type === "success"
                              ? "bg-green-500"
                              : log.type === "error"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <p className="text-gray-700">{log.message}</p>
                          <p className="text-gray-400 mt-0.5">{log.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
