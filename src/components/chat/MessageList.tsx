"use client"

import { Message } from "./ChatInterface"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { GraduationCap, MapPin, ExternalLink } from "lucide-react"

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] ${
              message.role === "user" ? "order-2" : "order-1"
            }`}
          >
            <Card
              className={
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }
            >
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* College Suggestions */}
                {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">
                      Suggested Colleges:
                    </p>
                    <div className="space-y-2">
                      {message.suggestions.map((college) => (
                        <Link
                          key={college.id}
                          href={`/colleges/${college.slug}`}
                          className="block"
                        >
                          <Card className="hover:bg-accent transition-colors cursor-pointer">
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
                  className={`text-xs mt-2 ${
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(message.timestamp, "HH:mm")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  )
}

