"use client"

import * as React from "react"
import { Checkbox as BaseCheckbox } from "@base-ui/react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps {
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onCheckedChange, onChange, id, disabled, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false)
    const isControlled = checked !== undefined
    const currentChecked = isControlled ? checked : internalChecked

    const handleCheckedChange = (newChecked: boolean) => {
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      // Create a synthetic event for onChange compatibility
      const syntheticEvent = {
        target: { checked: newChecked },
      } as React.ChangeEvent<HTMLInputElement>
      onChange?.(syntheticEvent)
      onCheckedChange?.(newChecked)
    }

    return (
      <BaseCheckbox.Root
        ref={ref}
        id={id}
        checked={currentChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
          currentChecked && "bg-primary text-primary-foreground",
          className
        )}
        {...props}
      >
        {currentChecked && (
          <BaseCheckbox.Indicator>
            <Check className="h-4 w-4" />
          </BaseCheckbox.Indicator>
        )}
      </BaseCheckbox.Root>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
