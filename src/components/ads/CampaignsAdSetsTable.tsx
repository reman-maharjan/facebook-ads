"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/src/components/ui/card"
import { getAdSets, getCampaigns, updateAdSetStatus, updateCampaignStatus } from "@/src/utils/facebookAds"
import Link from "next/link"

interface CampaignRow {
  id: string
  name: string
  status?: string
}

interface AdSetRow {
  id: string
  name: string
  status?: string
  campaign_id: string
}

export default function CampaignsAdSetsTable() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [adsets, setAdsets] = useState<AdSetRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [view, setView] = useState<"campaigns" | "adsets">("campaigns")

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError("")

    Promise.all([
      getCampaigns("id,name,status,objective"),
      getAdSets("id,name,status,campaign_id"),
    ])
      .then(([c, s]) => {
        if (!mounted) return
        const cList: CampaignRow[] = (c?.data || []).map((x: any) => ({ id: x.id, name: x.name, status: x.status }))
        const sList: AdSetRow[] = (s?.data || []).map((x: any) => ({ id: x.id, name: x.name, status: x.status, campaign_id: x.campaign_id }))
        setCampaigns(cList)
        setAdsets(sList)
      })
      .catch((e) => {
        if (!mounted) return
        setError(e?.message || "Failed to load data")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const rows = useMemo(() => {
    if (!campaigns.length && !adsets.length) return [] as Array<{ campaign?: CampaignRow; adset?: AdSetRow }>
    const map: Array<{ campaign?: CampaignRow; adset?: AdSetRow }> = []
    const adsetsByCampaign = adsets.reduce<Record<string, AdSetRow[]>>((acc, a) => {
      if (!acc[a.campaign_id]) acc[a.campaign_id] = []
      acc[a.campaign_id].push(a)
      return acc
    }, {})
    campaigns.forEach((c) => {
      const list = adsetsByCampaign[c.id] || []
      if (list.length === 0) {
        map.push({ campaign: c, adset: undefined })
      } else {
        list.forEach((a, idx) => {
          map.push({ campaign: idx === 0 ? c : undefined, adset: a })
        })
      }
    })
    return map
  }, [campaigns, adsets])

  return (
    <Card className="p-0 border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Campaigns and Ad Sets</h3>
        <div className="flex items-center gap-2 text-xs">
          <button
            className={`px-3 py-1 rounded border ${view === "campaigns" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300"}`}
            onClick={() => setView("campaigns")}
          >
            Campaigns
          </button>
          <button
            className={`px-3 py-1 rounded border ${view === "adsets" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-300"}`}
            onClick={() => setView("adsets")}
          >
            Ad Sets
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {view === "campaigns" ? (
                <>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2" />
                </>
              ) : (
                <>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Set</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Set ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-4 py-6 text-sm text-red-600" colSpan={6}>{error}</td>
              </tr>
            ) : (view === "campaigns" ? campaigns.length === 0 : adsets.length === 0) ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>No data</td>
              </tr>
            ) : (
              view === "campaigns"
                ? campaigns.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2 text-sm">
                        <Link
                          href={`/create-ad-set?campaignId=${encodeURIComponent(c.id)}`}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">{c.id}</td>
                      <td className="px-4 py-2 text-xs">
                        <span className={c.status === "ACTIVE" ? "text-green-600" : "text-gray-500"}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <label className="inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={c.status === "ACTIVE"}
                            onChange={async (e) => {
                              const next = e.target.checked ? "ACTIVE" : "PAUSED"
                              const old = c.status
                              setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)))
                              try {
                                await updateCampaignStatus(c.id, next)
                              } catch (err) {
                                setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: old } : x)))
                              }
                            }}
                          />
                          <span className={`h-5 w-9 rounded-full transition-colors ${c.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`}></span>
                          <span className="ml-2 text-[11px] text-gray-500">{c.status === "ACTIVE" ? "On" : "Off"}</span>
                        </label>
                      </td>
                    </tr>
                  ))
                : adsets.map((a) => {
                    const camp = campaigns.find((c) => c.id === a.campaign_id)
                    return (
                      <tr key={a.id}>
                        <td className="px-4 py-2 text-sm">
                          <Link
                            href={`/create-creative?adSetId=${encodeURIComponent(a.id)}&campaignId=${encodeURIComponent(a.campaign_id)}`}
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            {a.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">{a.id}</td>
                        <td className="px-4 py-2 text-xs">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={a.status === "ACTIVE"}
                              onChange={async (e) => {
                                const next = e.target.checked ? "ACTIVE" : "PAUSED"
                                const old = a.status
                                setAdsets((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: next } : x)))
                                try {
                                  await updateAdSetStatus(a.id, next)
                                } catch (err) {
                                  setAdsets((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: old } : x)))
                                }
                              }}
                            />
                            <span className={`h-5 w-9 rounded-full transition-colors ${a.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`}></span>
                            <span className="ml-2 text-[11px] text-gray-500">{a.status === "ACTIVE" ? "On" : "Off"}</span>
                          </label>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">{camp?.name || a.campaign_id}</td>
                      </tr>
                    )
                  })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
