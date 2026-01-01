"use client"

import { useState, useEffect } from "react"
import { Share2, Check, Copy, Twitter, Facebook, Linkedin } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
  variant?: "outline" | "default" | "ghost" | "secondary"
  className?: string
  showLabel?: boolean
}

export function ShareButton({
  title,
  text,
  url,
  variant = "outline",
  className,
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shareUrl, setShareUrl] = useState(url || "")
  const [MenuComponents, setMenuComponents] = useState<typeof import("@/components/ui/dropdown-menu") | null>(null)
  
  useEffect(() => {
    setMounted(true)
    if (!url && typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
    
    // Dynamically import Menu components only on client
    if (typeof window !== "undefined") {
      import("@/components/ui/dropdown-menu").then((mod) => {
        setMenuComponents(mod)
      })
    }
  }, [url])
  
  const shareText = text || `Check out ${title} on SeeMyCampus!`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = (platform: "twitter" | "facebook" | "linkedin") => {
    let platformUrl = ""
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    switch (platform) {
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
    }

    window.open(platformUrl, "_blank", "width=600,height=400")
  }

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    }
  }

  // Prevent hydration mismatch by only rendering dropdown after mount and Menu components are loaded
  if (!mounted || !MenuComponents) {
    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant }), className)}
        disabled
        aria-label="Share"
        suppressHydrationWarning
      >
        <Share2 className={`h-4 w-4 ${showLabel ? "mr-2" : ""}`} />
        {showLabel && "Share"}
      </button>
    )
  }

  const {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } = MenuComponents

  return (
    <div suppressHydrationWarning>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant }), className)}
          onClick={(e) => {
            if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function" && window.innerWidth < 768) {
              e.preventDefault()
              nativeShare()
            }
          }}
        >
          <Share2 className={`h-4 w-4 ${showLabel ? "mr-2" : ""}`} />
          {showLabel && "Share"}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer">
            <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
            Twitter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer">
            <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer">
            <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2]" />
            LinkedIn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


