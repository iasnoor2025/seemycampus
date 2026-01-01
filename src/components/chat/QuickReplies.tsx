"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Briefcase, Calculator, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export interface QuickReply {
  label: string
  message?: string
  icon?: React.ReactNode
  action?: "navigate" | "message" | "location"
  path?: string
}

export const COMMON_QUESTIONS: QuickReply[] = [
  {
    label: "Find Colleges",
    message: "I'm a student looking for colleges in India. Can you help me find the best colleges based on my interests?",
    icon: <GraduationCap className="h-4 w-4" />,
    action: "message",
  },
  {
    label: "Admissions",
    message: "I'm preparing for college admissions in India. What are the admission requirements and entrance exams like JEE, NEET, CAT that I need to know about?",
    icon: <BookOpen className="h-4 w-4" />,
    action: "message",
  },
  {
    label: "Scholarships",
    message: "I'm looking for scholarships to help fund my college education in India. What options are available?",
    icon: <span className="text-base">₹</span>,
    action: "navigate",
    path: "/scholarships",
  },
  {
    label: "Career Help",
    message: "I need help choosing the right career path and college in India. Can you guide me?",
    icon: <Briefcase className="h-4 w-4" />,
    action: "navigate",
    path: "/career-counseling",
  },
  {
    label: "Fee Calculator",
    message: "I want to calculate the total cost of college education in India including tuition, hostel, and other fees.",
    icon: <Calculator className="h-4 w-4" />,
    action: "navigate",
    path: "/fee-calculator",
  },
  {
    label: "Near Me",
    message: "I want to find colleges near my location in India",
    icon: <MapPin className="h-4 w-4" />,
    action: "location",
  },
]

interface QuickRepliesProps {
  replies?: QuickReply[]
  onSelect: (message: string) => void
  disabled?: boolean
  className?: string
}

export function QuickReplies({ 
  replies = COMMON_QUESTIONS, 
  onSelect, 
  disabled = false,
  className 
}: QuickRepliesProps) {
  const router = useRouter()

  const handleClick = (reply: QuickReply) => {
    if (disabled) return

    if (reply.action === "navigate" && reply.path) {
      // Navigate to the page
      router.push(reply.path)
      // Also send a message to the chat for context
      if (reply.message) {
        onSelect(reply.message)
      }
    } else if (reply.action === "location") {
      // Handle location-based search
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            onSelect(`Find colleges near me. My location is approximately ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          },
          () => {
            // If location access denied or failed, ask for city/state
            onSelect("Find colleges near me. Please help me find colleges in my city or state in India")
          }
        )
      } else {
        // Geolocation not supported, ask for city/state
        onSelect("Find colleges near me. Please help me find colleges in my city or state in India")
      }
    } else if (reply.message) {
      // Default: send message
      onSelect(reply.message)
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleClick(reply)}
          disabled={disabled}
          className="h-auto py-2 px-3 text-xs sm:text-sm whitespace-nowrap touch-manipulation border-gray-300 hover:border-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-200 rounded-lg shadow-sm hover:shadow-md bg-white"
        >
          {reply.icon && <span className="mr-1.5">{reply.icon}</span>}
          {reply.label}
        </Button>
      ))}
    </div>
  )
}

