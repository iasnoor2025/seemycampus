"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

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
    <div className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 text-sm sm:text-base border-gray-300 focus:border-[#18254a] focus:ring-[#18254a] rounded-lg bg-white shadow-sm transition-all duration-200"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <Button 
        onClick={handleSend} 
        disabled={disabled || !message.trim()} 
        size="icon"
        className="flex-shrink-0 touch-manipulation bg-gradient-to-br from-[#18254a] to-[#1a2d5a] hover:from-[#1a2d5a] hover:to-[#213366] text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}

