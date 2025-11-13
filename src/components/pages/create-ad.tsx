'use client'
import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/src/components/header"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { CheckCircle2 } from "lucide-react"
import { createAd, createAdCreative, getAdSets, getAdSetsByCampaign } from "@/src/utils/facebookAds"

export default function CreateAd() {
  const [adName, setAdName] = useState("")
  const [callToAction, setCallToAction] = useState("learn-more")
  const [destinationUrl, setDestinationUrl] = useState("")
  const [trackingPixel, setTrackingPixel] = useState("")
  const [adSets, setAdSets] = useState<Array<{ id: string; name: string }>>([])
  const [selectedAdSetId, setSelectedAdSetId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const params = useSearchParams()
  const [prefilledCreativeId, setPrefilledCreativeId] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdSetId || !adName) return
    setSubmitting(true)
    const run = prefilledCreativeId
      ? Promise.resolve({ id: prefilledCreativeId })
      : createAdCreative(adName)

    run
      .then((creative) => {
        const creativeId = (creative?.id as string) || prefilledCreativeId
        if (!creativeId) throw new Error("Creative not created")
        return createAd(selectedAdSetId, creativeId)
      })
      .then(() => {
        alert(`Ad "${adName}" created!`)
      })
      .finally(() => setSubmitting(false))
  }

  const ctaOptions = [
    "learn-more",
    "shop-now",
    "download",
    "sign-up",
    "book-now",
    "get-offer",
    "contact-us",
    "subscribe",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Ad" description="Configure your final ad settings and launch" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ad Name */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">Ad Name</label>
                <Input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="e.g., Summer Sale - CTA Test 1"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
                <p className="text-xs text-muted-foreground mt-2">Used for reporting and organization</p>
              </Card>

              {/* Call to Action */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">Call to Action Button</label>
                <div className="grid grid-cols-2 gap-3">
                  {ctaOptions.map((cta) => (
                    <button
                      key={cta}
                      type="button"
                      onClick={() => setCallToAction(cta)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm capitalize font-medium ${
                        callToAction === cta
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {cta.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Destination Settings */}
              <Card className="p-6 bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">Destination Settings</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Website URL</label>
                  <Input
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tracking Pixel (Optional)</label>
                  <Input
                    type="text"
                    value={trackingPixel}
                    onChange={(e) => setTrackingPixel(e.target.value)}
                    placeholder="Paste your pixel ID"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Track conversions with your pixel</p>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                disabled={submitting}
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? "Creating..." : "Launch Ad"}
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
