"use client"

import { Message } from "./ChatInterface"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

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

