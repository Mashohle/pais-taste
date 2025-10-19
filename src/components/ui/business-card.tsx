import * as React from "react"

import { cn } from "@/lib/utils"

function BusinessCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="business-card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function BusinessCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="business-card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

export {
  BusinessCard,
  BusinessCardContent,
}
