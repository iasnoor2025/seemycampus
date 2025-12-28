"use client"

import { ReactNode } from "react"

interface RichTextProps {
  content: string
  className?: string
}

/**
 * Component to render text with HTML links
 * Safely renders HTML content with contextual links
 */
export function RichText({ content, className = "" }: RichTextProps) {
  // Simple sanitization - in production, use a proper HTML sanitizer like DOMPurify
  const sanitizedContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "")

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}

