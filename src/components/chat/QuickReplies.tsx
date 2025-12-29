"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Briefcase, HelpCircle, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuickReply {
  label: string
  message: string
  icon?: React.ReactNode
}

export const COMMON_QUESTIONS: QuickReply[] = [
  {
    label: "Find Colleges",
    message: "Show me colleges for engineering",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    label: "Admissions",
    message: "What are the admission requirements?",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    label: "Scholarships",
    message: "Tell me about scholarship opportunities",
    icon: <span className="text-base">₹</span>,
  },
  {
    label: "Career Help",
    message: "I need career counseling guidance",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    label: "Fee Calculator",
    message: "Help me calculate college fees",
    icon: <span className="text-base">₹</span>,
  },
  {
    label: "Near Me",
    message: "Find colleges near me",
    icon: <MapPin className="h-4 w-4" />,
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
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(reply.message)}
          disabled={disabled}
          className="h-auto py-2 px-3 text-xs sm:text-sm whitespace-nowrap touch-manipulation border-gray-300 hover:border-[#18254a] hover:bg-[#18254a] hover:text-white transition-all duration-200 rounded-lg shadow-sm hover:shadow-md bg-white"
        >
          {reply.icon && <span className="mr-1.5">{reply.icon}</span>}
          {reply.label}
        </Button>
      ))}
    </div>
  )
}

