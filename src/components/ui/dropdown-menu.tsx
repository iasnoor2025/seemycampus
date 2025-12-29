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
    // When asChild is true, Menu.Trigger will render a button
    // We need to merge the child's props with Menu.Trigger's button
    // The child (Button component) should use asChild to avoid rendering its own button
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
    align?: "start" | "center" | "end"
  }
>(({ className, sideOffset = 4, align = "start", ...props }, ref) => (
  <Menu.Portal>
    <Menu.Positioner
      side="bottom"
      align={align}
      sideOffset={sideOffset}
    >
      <Menu.Popup
        ref={ref}
        className={cn(
          "z-[9999] min-w-[8rem] overflow-visible rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        style={{ position: 'relative' }}
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

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
