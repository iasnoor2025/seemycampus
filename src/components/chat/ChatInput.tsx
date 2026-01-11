"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2.5 items-end">
      <div className="flex-1 relative">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
          placeholder="Ask me anything about colleges, courses, or admissions..."
        disabled={disabled}
          className="w-full text-sm sm:text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white shadow-sm transition-all duration-200 pr-10 py-3 placeholder:text-gray-400"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
        {!message.trim() && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Sparkles className="h-4 w-4 text-gray-300" />
          </div>
        )}
      </div>
      <Button 
        onClick={handleSend} 
        disabled={disabled || !message.trim()} 
        size="icon"
        className="flex-shrink-0 h-11 w-11 touch-manipulation bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg hover:scale-105 active:scale-95"
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}

