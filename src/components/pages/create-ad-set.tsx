"use client";
import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/src/components/header"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ArrowRight } from "lucide-react"
import { createAdSet, getCampaigns } from "@/src/utils/facebookAds"

export default function CreateAdSet() {
  const [adSetName, setAdSetName] = useState("")
  const [ageMin, setAgeMin] = useState("")
  const [ageMax, setAgeMax] = useState("")
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US"])
  const [bidStrategy, setBidStrategy] = useState("lowest-cost")
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const cid = params.get("campaignId") || ""
    if (cid) setSelectedCampaignId(cid)
    getCampaigns()
      .then((res) => {
        const list = (res?.data || []).map((c: any) => ({ id: c.id, name: c.name }))
        setCampaigns(list)
      })
      // eslint-disable-next-line no-empty
      .catch(() => {})
  }, [params])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaignId || !adSetName) return
    setSubmitting(true)
    createAdSet(selectedCampaignId, adSetName)
      .then((res) => {
        const id = res?.id
        if (id) router.push(`/create-creative?adSetId=${encodeURIComponent(id)}`)
      })
      .finally(() => setSubmitting(false))
  }

  const countries = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "IN", "BR", "MX"]
  const genders = ["All", "Men", "Women"]
  const bidStrategies = [
    { value: "lowest-cost", label: "Lowest Cost", desc: "Facebook optimizes for lowest cost" },
    { value: "target-cost", label: "Target Cost", desc: "Target specific cost per result" },
    { value: "bid-cap", label: "Bid Cap", desc: "Set maximum bid amount" },
  ]

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Ad Set" description="Define your audience and budget allocation" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Selector */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">Select Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full bg-input border border-border rounded-md p-2 text-foreground"
                  required
                >
                  <option value="" disabled>
                    Choose campaign
                  </option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Card>

              {/* Ad Set Name */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">Ad Set Name</label>
                <Input
                  type="text"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  placeholder="e.g., Audience A - Age 25-34"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </Card>

              {/* Audience Targeting */}
              <Card className="p-6 bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">Audience Targeting</h3>

                {/* Age Range */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-2 block">Age Range</label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      placeholder="Min"
                      min="13"
                      max="65"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground flex-1"
                    />
                    <span className="text-muted-foreground py-2">to</span>
                    <Input
                      type="number"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      placeholder="Max"
                      min="13"
                      max="65"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground flex-1"
                    />
                  </div>
                </div>

                {/* Locations */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Locations</label>
                  <div className="grid grid-cols-2 gap-2">
                    {countries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleCountry(country)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          selectedCountries.includes(country)
                            ? "border-primary bg-primary/5 text-foreground font-medium"
                            : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                  <div className="flex gap-2">
                    {genders.map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        className="px-4 py-2 rounded-lg border-2 border-border bg-muted hover:border-primary/50 text-sm text-foreground transition-all"
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Bid Strategy */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">Bid Strategy</label>
                <div className="space-y-2">
                  {bidStrategies.map((strategy) => (
                    <button
                      key={strategy.value}
                      type="button"
                      onClick={() => setBidStrategy(strategy.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        bidStrategy === strategy.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium text-foreground">{strategy.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{strategy.desc}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Next: Create Creative"} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Sidebar - Reserved for future real insights */}
          <div></div>
        </div>
      </div>
    </div>
  )
}
