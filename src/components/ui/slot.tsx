"use client"

import * as React from "react"

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>
      const childRef = (children as any).ref
      return React.cloneElement(children, {
        ...props,
        ...childProps,
        ref: (node: HTMLElement) => {
          if (typeof ref === "function") {
            ref(node)
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLElement | null>).current = node
          }
          if (childRef) {
            if (typeof childRef === "function") {
              childRef(node)
            } else {
              (childRef as React.MutableRefObject<HTMLElement | null>).current = node
            }
          }
        },
      } as any)
    }
    return <>{children}</>
  }
)
Slot.displayName = "Slot"

export { Slot }
