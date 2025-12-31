"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Lightbulb } from "lucide-react"
import { extractKeywords, optimizeMetaDescription, estimateReadingTime, generateTableOfContents } from "@/lib/blog/contentOptimizer"
import { getBlogTemplate, generateSEOChecklist } from "@/lib/blog/blogTemplates"

interface BlogSEOHelperProps {
  title: string
  content: string
  excerpt: string
  category?: string
  tags?: string[]
}

export function BlogSEOHelper({ title, content, excerpt, category, tags = [] }: BlogSEOHelperProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const keywords = extractKeywords(content, 10)
  const readingTime = estimateReadingTime(content)
  const wordCount = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length
  const toc = generateTableOfContents(content)
  const optimizedDescription = optimizeMetaDescription(excerpt || content.substring(0, 200))
  
  // SEO Checks
  const seoChecks = {
    titleLength: title.length >= 30 && title.length <= 60,
    titleKeyword: keywords.some(k => title.toLowerCase().includes(k.toLowerCase())),
    descriptionLength: optimizedDescription.length >= 120 && optimizedDescription.length <= 160,
    descriptionKeyword: keywords.some(k => optimizedDescription.toLowerCase().includes(k.toLowerCase())),
    wordCount: wordCount >= 1500,
    hasHeadings: toc.length > 0,
    hasImages: /<img[^>]+>/i.test(content),
    hasInternalLinks: /<a[^>]+href=["']\/(colleges|courses|entrance-exams|scholarships)/i.test(content),
    hasFAQ: /<h[23][^>]*>.*\?.*<\/h[23]>/i.test(content),
  }
  
  const seoScore = Math.round((Object.values(seoChecks).filter(Boolean).length / Object.keys(seoChecks).length) * 100)
  
  const template = category ? getBlogTemplate(category) : null
  const seoChecklist = template ? generateSEOChecklist(template) : []
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              SEO Helper
            </CardTitle>
            <CardDescription>SEO optimization suggestions for your blog post</CardDescription>
          </div>
          <Badge variant={seoScore >= 70 ? "default" : seoScore >= 50 ? "secondary" : "destructive"}>
            Score: {seoScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Word Count</p>
            <p className="text-2xl font-bold">{wordCount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Reading Time</p>
            <p className="text-2xl font-bold">{readingTime} min</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Headings</p>
            <p className="text-2xl font-bold">{toc.length}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Keywords</p>
            <p className="text-2xl font-bold">{keywords.length}</p>
          </div>
        </div>
        
        {/* SEO Checks */}
        <div>
          <h3 className="font-semibold mb-2">SEO Checklist</h3>
          <div className="space-y-2">
            {Object.entries(seoChecks).map(([key, passed]) => (
              <div key={key} className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Keywords */}
        <div>
          <h3 className="font-semibold mb-2">Suggested Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Optimized Description */}
        <div>
          <h3 className="font-semibold mb-2">Optimized Meta Description</h3>
          <p className="text-sm text-gray-600 bg-slate-50 p-3 rounded border">
            {optimizedDescription}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Length: {optimizedDescription.length} characters (optimal: 120-160)
          </p>
        </div>
        
        {/* Template Checklist */}
        {template && (
          <div>
            <h3 className="font-semibold mb-2">Template-Specific SEO Tips</h3>
            <ul className="space-y-1 text-sm">
              {seoChecklist.slice(0, 5).map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? "Hide" : "Show"} Details
        </Button>
        
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            {/* Table of Contents Preview */}
            {toc.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Table of Contents</h3>
                <ul className="space-y-1 text-sm">
                  {toc.slice(0, 10).map((item, index) => (
                    <li key={index} className={`${item.level === 3 ? "ml-4" : item.level === 4 ? "ml-8" : ""}`}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

