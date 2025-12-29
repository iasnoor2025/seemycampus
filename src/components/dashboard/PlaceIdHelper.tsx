"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Search, Copy, Check } from "lucide-react"

interface PlaceIdHelperProps {
  value: string
  onChange: (value: string) => void
}

export function PlaceIdHelper({ value, onChange }: PlaceIdHelperProps) {
  const [url, setUrl] = useState("")
  const [extracted, setExtracted] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const extractFromUrl = () => {
    if (!url.trim()) return

    try {
      // Try to extract from various URL formats
      const urlObj = new URL(url)
      
      // Method 1: Check for place_id query parameter
      const placeIdParam = urlObj.searchParams.get("place_id")
      if (placeIdParam) {
        setExtracted(placeIdParam)
        onChange(placeIdParam)
        return
      }

      // Method 2: Try to extract from data parameter
      // Format: data=...!1s0x...:0x...
      const dataMatch = url.match(/data=[^!]*!1s([^!]+)/)
      if (dataMatch) {
        const candidate = dataMatch[1]
        // Place IDs in URLs are often encoded, try to decode
        if (candidate.includes("0x") || candidate.length > 15) {
          setExtracted(candidate)
          onChange(candidate)
          return
        }
      }

      // Method 3: Check if URL contains a Place ID pattern
      // Place IDs typically start with ChIJ or similar
      const placeIdPattern = /(ChIJ[a-zA-Z0-9_-]{27})/i
      const match = url.match(placeIdPattern)
      if (match) {
        setExtracted(match[1])
        onChange(match[1])
        return
      }

      // If we can't extract, show instructions
      setExtracted(null)
      alert(
        "Could not automatically extract Place ID from this URL.\n\n" +
        "Please:\n" +
        "1. Open the Google Maps link\n" +
        "2. Right-click on the location marker\n" +
        "3. Or use the Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id"
      )
    } catch (error) {
      alert("Invalid URL. Please enter a valid Google Maps URL.")
    }
  }

  const copyToClipboard = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="googlePlaceId">Google Place ID</Label>
        <div className="flex gap-2">
          <Input
            id="googlePlaceId"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ChIJ..."
            className="flex-1"
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              title="Copy Place ID"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="border-t pt-3">
        <Label className="text-sm font-medium mb-2 block">
          Extract from Google Maps URL
        </Label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste Google Maps URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                extractFromUrl()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={extractFromUrl}
            disabled={!url.trim()}
          >
            <Search className="h-4 w-4 mr-2" />
            Extract
          </Button>
        </div>
        {extracted && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Extracted Place ID: {extracted}
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>How to find Place ID:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            Paste a Google Maps URL above and click "Extract"
          </li>
          <li>
            Or use the{" "}
            <a
              href="https://developers.google.com/maps/documentation/places/web-service/place-id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Place ID Finder
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            Or search the college on Google Maps, click it, and check the URL
            for a "place_id" parameter
          </li>
        </ul>
      </div>
    </div>
  )
}

