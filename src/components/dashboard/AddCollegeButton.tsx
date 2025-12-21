"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddCollegeButtonProps {
  onClick: () => void
}

export function AddCollegeButton({ onClick }: AddCollegeButtonProps) {
  return (
    <Button className="flex items-center gap-2" onClick={onClick}>
      <Plus className="h-4 w-4" />
      Add College
    </Button>
  )
}

