"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/src/components/header"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ArrowRight } from "lucide-react"
import { createCampaign } from "@/src/utils/facebookAds"

export  function CreateCampaign() {
  const [campaignName, setCampaignName] = useState("")
  const [objective, setObjective] = useState("awareness")
  const [dailyBudget, setDailyBudget] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName) return
    setSubmitting(true)
    createCampaign(campaignName)
      .then((res) => {
        const id = res?.id
        if (id) {
          router.push(`/create-ad-set?campaignId=${encodeURIComponent(id)}`)
        }
      })
      .finally(() => setSubmitting(false))
  }

  const objectives = [
    { value: "awareness", label: "Brand Awareness", icon: "👁️" },
    { value: "consideration", label: "Consideration", icon: "🤔" },
    { value: "conversion", label: "Conversions", icon: "✅" },
    { value: "leads", label: "Leads", icon: "📋" },
    { value: "traffic", label: "Traffic", icon: "🔗" },
    { value: "app-installs", label: "App Installs", icon: "📱" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Campaign" description="Start a new advertising campaign" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Name */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">Campaign Name</label>
                <Input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Sale 2024"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">Give your campaign a memorable name</p>
              </Card>

              {/* Campaign Objective */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">Campaign Objective</label>
                <div className="grid grid-cols-2 gap-3">
                  {objectives.map((obj) => (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => setObjective(obj.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        objective === obj.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{obj.icon}</div>
                      <div className="font-medium text-sm text-foreground">{obj.label}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Budget */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">Daily Budget</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">$</span>
                  <Input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    placeholder="100.00"
                    step="0.01"
                    min="0"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Minimum daily budget is $5.00</p>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Next: Create Ad Set"} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Sidebar - Tips */}
          <div>
            <Card className="p-6 bg-card border border-border sticky top-6">
              <h3 className="font-semibold text-foreground mb-4">Campaign Tips</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">Name it clearly</p>
                  <p>Use descriptive names to easily identify campaigns in reports.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Pick the right objective</p>
                  <p>Choose the objective that matches your business goal.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Set realistic budget</p>
                  <p>Start with a budget you're comfortable testing with.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
