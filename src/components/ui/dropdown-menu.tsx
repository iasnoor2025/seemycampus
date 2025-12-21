"use client"

import * as React from "react"
import { Menu } from "@base-ui/react"
import { Slot } from "./slot"
import { cn } from "@/lib/utils"

// Base UI Menu implementation
const DropdownMenu = Menu.Root

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Menu.Trigger> & {
    asChild?: boolean
  }
>(({ asChild = false, className, children, ...props }, ref) => {
  const triggerProps = {
    className: cn(className),
    ...props,
  }
  
  if (asChild) {
    return (
      <Menu.Trigger>
        <Slot ref={ref} {...triggerProps}>
          {children}
        </Slot>
      </Menu.Trigger>
    )
  }
  return (
    <Menu.Trigger
      ref={ref}
      {...triggerProps}
    >
      {children}
    </Menu.Trigger>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Menu.Popup> & {
    sideOffset?: number
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup
        ref={ref}
        className={cn(
          "z-[9999] min-w-[8rem] overflow-visible rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        style={{ marginTop: `${sideOffset}px`, position: 'relative' }}
        {...props}
      />
    </Menu.Positioner>
  </Menu.Portal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Menu.Item> & {
    inset?: boolean
    asChild?: boolean
  }
>(({ className, inset, asChild = false, children, ...props }, ref) => {
  if (asChild) {
    return (
      <Menu.Item>
        <Slot
          ref={ref}
          className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            inset && "pl-8",
            className
          )}
          {...props}
        >
          {children}
        </Slot>
      </Menu.Item>
    )
  }
  return (
    <Menu.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </Menu.Item>
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
