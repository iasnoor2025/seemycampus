"use client"

import { Message } from "./ChatInterface"
import { QuickReplies } from "./QuickReplies"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { GraduationCap, MapPin, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface MessageListProps {
  messages: Message[]
  onQuickReply?: (message: string) => void
  disabled?: boolean
}

export function MessageList({ messages, onQuickReply, disabled = false }: MessageListProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {messages.map((message, index) => (
        <div key={index} className="space-y-2 sm:space-y-3">
          <div
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] ${
                message.role === "user" ? "order-2" : "order-1"
              }`}
            >
              <Card
                className={
                  message.role === "user"
                    ? "bg-gradient-to-br from-[#18254a] to-[#1a2d5a] text-white shadow-lg border-0 backdrop-blur-sm"
                    : "bg-white border-2 border-gray-300 shadow-lg backdrop-blur-sm"
                }
              >
                <CardContent className="p-3 sm:p-4">
                  <div className={`text-sm sm:text-sm whitespace-pre-wrap break-words leading-relaxed ${
                    message.role === "user" ? "text-white" : "text-gray-800"
                  }`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className={`mb-2 last:mb-0 ${message.role === "user" ? "text-white" : "text-gray-800"}`}>{children}</p>,
                        strong: ({ children }) => <strong className={`font-semibold ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className={`list-disc list-inside mb-2 space-y-1 ${message.role === "user" ? "text-white" : "text-gray-800"}`}>{children}</ul>,
                        ol: ({ children }) => <ol className={`list-decimal list-inside mb-2 space-y-1 ${message.role === "user" ? "text-white" : "text-gray-800"}`}>{children}</ol>,
                        li: ({ children }) => <li className="ml-2">{children}</li>,
                        h1: ({ children }) => <h1 className={`text-lg font-bold mb-2 ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h1>,
                        h2: ({ children }) => <h2 className={`text-base font-bold mb-2 ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h2>,
                        h3: ({ children }) => <h3 className={`text-sm font-bold mb-1 ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h3>,
                        code: ({ children }) => <code className={`${message.role === "user" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900"} px-1 py-0.5 rounded text-xs font-mono`}>{children}</code>,
                        blockquote: ({ children }) => <blockquote className={`border-l-4 ${message.role === "user" ? "border-white/30 text-white/90" : "border-gray-300 text-gray-700"} pl-2 italic my-2`}>{children}</blockquote>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* College Suggestions */}
                  {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-2">
                        {message.suggestions.map((college) => (
                        <Link
                          key={college.id}
                          href={`/colleges/${college.slug}`}
                          className="block group"
                        >
                          <Card className="hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-[#18254a]/20">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <GraduationCap className="h-4 w-4 text-primary" />
                                      <span className="font-semibold text-sm">{college.name}</span>
                                      {college.ranking && (
                                        <Badge variant="secondary" className="text-xs">
                                          Rank #{college.ranking}
                                        </Badge>
                                      )}
                                    </div>
                                    {(college.city || college.location) && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {college.city || college.location}
                                      </div>
                                    )}
                                    {college.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {college.description}
                                      </p>
                                    )}
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p
                    className={`text-xs mt-3 ${
                      message.role === "user"
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}
                  >
                    {format(message.timestamp, "HH:mm")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Quick Replies */}
          {message.role === "assistant" && message.showQuickReplies && onQuickReply && (
            <div className="px-1 sm:px-0">
              <QuickReplies 
                onSelect={onQuickReply} 
                disabled={disabled}
                className="justify-start"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

