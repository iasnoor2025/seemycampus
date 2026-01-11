"use client"

import { Message } from "./ChatInterface"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { GraduationCap, MapPin, ExternalLink, Sparkles, ArrowRight } from "lucide-react"
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
        <div key={index} data-message-index={index} className="space-y-2">
          <div
            className={`flex items-start gap-2.5 sm:gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar for assistant messages */}
            {message.role === "assistant" && (
              <div className="flex-shrink-0 relative">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] sm:max-w-[70%] md:max-w-[65%] ${
                message.role === "user" ? "order-2" : "order-1"
              }`}
            >
              <div
                className={`rounded-xl shadow-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-[#18254a] to-[#1a2d5a] text-white"
                    : "bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 text-gray-900"
                }`}
              >
                <div className="p-3 sm:p-4">
                  <div className={`text-sm sm:text-base whitespace-pre-wrap break-words leading-normal ${
                    message.role === "user" ? "text-white" : "text-gray-800"
                  }`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className={`mb-1.5 last:mb-0 leading-normal ${message.role === "user" ? "text-white/95" : "text-gray-800"}`}>{children}</p>,
                        strong: ({ children }) => <strong className={`font-semibold ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className={`list-disc list-outside mb-3 ml-4 space-y-1.5 ${message.role === "user" ? "text-white/95" : "text-gray-800"}`}>{children}</ul>,
                        ol: ({ children }) => <ol className={`list-decimal list-outside mb-3 ml-4 space-y-1.5 ${message.role === "user" ? "text-white/95" : "text-gray-800"}`}>{children}</ol>,
                        li: ({ children }) => <li className="pl-1">{children}</li>,
                        h1: ({ children }) => <h1 className={`text-xl font-bold mb-3 mt-2 ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h1>,
                        h2: ({ children }) => <h2 className={`text-lg font-bold mb-2 mt-2 ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h2>,
                        h3: ({ children }) => <h3 className={`text-base font-semibold mb-2 mt-2 ${message.role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h3>,
                        code: ({ children }) => <code className={`${message.role === "user" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900"} px-2 py-1 rounded-md text-xs font-mono`}>{children}</code>,
                        blockquote: ({ children }) => <blockquote className={`border-l-3 ${message.role === "user" ? "border-white/40 text-white/90 bg-white/10" : "border-blue-300 text-gray-700 bg-blue-50/50"} pl-4 py-2 my-3 rounded-r-md`}>{children}</blockquote>,
                        a: ({ href, children }) => (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`underline ${message.role === "user" ? "text-blue-200 hover:text-blue-100" : "text-blue-600 hover:text-blue-700"}`}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* College Suggestions - Clean Professional Design */}
                  {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          {message.suggestions.length === 1 ? "College Information" : "Recommended Colleges"}
                        </h4>
                      </div>
                      <div className="space-y-2.5">
                        {message.suggestions
                          .filter((college, index, self) => 
                            // Remove duplicates by checking if name already appeared
                            index === self.findIndex(c => 
                              c.name.toLowerCase().trim() === college.name.toLowerCase().trim()
                            )
                          )
                          .slice(0, 5) // Limit to 5 best results
                          .map((college) => (
                          <Link
                            key={college.id}
                            href={`/colleges/${college.slug}`}
                            className="block group"
                          >
                            <Card className="hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer border border-gray-200 bg-white">
                              <CardContent className="p-3.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                        {college.name}
                                      </span>
                                      {college.ranking && (
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0"
                                        >
                                          #{college.ranking}
                                        </Badge>
                                      )}
                                    </div>
                                    {(college.city || college.location) && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{college.city || college.location}</span>
                                      </div>
                                    )}
                                    {college.description && (
                                      <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed mt-1">
                                        {college.description}
                                      </p>
                                    )}
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors mt-0.5" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                      
                      {/* Direct link button for single college */}
                      {message.suggestions.length === 1 && (
                        <div className="mt-3">
                          <Link href={`/colleges/${message.suggestions[0].slug}`}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                              <span>View {message.suggestions[0].name} Details</span>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-white/60"
                        : "text-gray-400"
                    }`}
                  >
                    {format(message.timestamp, "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Avatar for user messages */}
            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md">
                  <span className="text-white text-[10px] sm:text-xs font-semibold">You</span>
                </div>
              </div>
            )}
          </div>
          
        </div>
      ))}
    </div>
  )
}

