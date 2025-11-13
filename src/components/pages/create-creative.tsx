"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/src/components/header"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Upload, ImageIcon } from "lucide-react"
import { createAdCreative } from "@/src/utils/facebookAds"
import { useEffect } from "react"
import { getAdSets, getAdSetsByCampaign } from "@/src/utils/facebookAds"

export default function CreateCreative() {
  const [creativeType, setCreativeType] = useState<"single-image" | "carousel" | "video">("single-image")
  const [headline, setHeadline] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const params = useSearchParams()
  const router = useRouter()
  const [adSets, setAdSets] = useState<Array<{ id: string; name: string }>>([])
  const [selectedAdSetId, setSelectedAdSetId] = useState<string>("")

  useEffect(() => {
    const adSetId = params.get("adSetId") || ""
    const campaignId = params.get("campaignId") || ""
    if (adSetId) setSelectedAdSetId(adSetId)
    const fetch = campaignId ? getAdSetsByCampaign(campaignId) : getAdSets()
    fetch
      .then((res) => {
        const list = (res?.data || []).map((s: any) => ({ id: s.id, name: s.name }))
        setAdSets(list)
      })
      // eslint-disable-next-line no-empty
      .catch(() => {})
  }, [params])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const fileName = e.target.files[0].name
      setUploadedFile(fileName)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const adSetId = selectedAdSetId
    if (!adSetId) return
    setSubmitting(true)
    const name = headline || `Creative ${new Date().toLocaleString()}`
    createAdCreative(name)
      .then((res) => {
        const creativeId = res?.id as string
        if (creativeId) {
          const next = `/create-ad?adSetId=${encodeURIComponent(adSetId)}&creativeId=${encodeURIComponent(creativeId)}`
          router.push(next)
        }
      })
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Creative" description="Upload and configure your ad creative" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ad Set Selector */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">Select Ad Set</label>
                <select
                  value={selectedAdSetId}
                  onChange={(e) => setSelectedAdSetId(e.target.value)}
                  className="w-full bg-input border border-border rounded-md p-2 text-foreground"
                  required
                >
                  <option value="" disabled>
                    Choose ad set
                  </option>
                  {adSets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Card>
              {/* Creative Type Selection */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">Creative Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "single-image" as const, label: "Single Image", icon: "🖼️" },
                    { value: "carousel" as const, label: "Carousel", icon: "📸" },
                    { value: "video" as const, label: "Video", icon: "🎥" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setCreativeType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        creativeType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-sm font-medium text-foreground">{type.label}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Media Upload */}
              <Card className="p-6 bg-card border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">Upload Media</label>
                <label className="border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground text-center">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">PNG, JPG, GIF or MP4 (Max 4MB)</p>
                  </div>
                  <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                </label>
                {uploadedFile && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{uploadedFile}</span>
                  </div>
                )}
              </Card>

              {/* Headline & Description */}
              <Card className="p-6 bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">Ad Copy</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Headline</label>
                  <Input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="What's your main message?"
                    maxLength={125}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{headline.length}/125 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell users more about your offer"
                    maxLength={300}
                    rows={4}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{description.length}/300 characters</p>
                </div>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Next: Review & Create Ad
              </Button>
            </form>
          </div>

          {/* Preview */}
          <div>
            <Card className="p-6 bg-card border border-border sticky top-6">
              <h3 className="font-semibold text-foreground mb-4">Preview</h3>
              <div className="bg-muted rounded-lg p-4 aspect-square flex flex-col justify-center items-center mb-4">
                <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {uploadedFile ? "Media Preview" : "Your creative will appear here"}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                {headline && (
                  <div>
                    <p className="font-medium text-foreground">{headline}</p>
                  </div>
                )}
                {description && <p className="text-muted-foreground text-xs line-clamp-3">{description}</p>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
