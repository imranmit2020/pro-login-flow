import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border py-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 relative",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 relative z-10", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6 relative z-10", className)}
      {...props}
    />
  )
}

// New enhanced card variants
function FutureCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-xl text-card-foreground flex flex-col gap-6 rounded-3xl border border-white/20 dark:border-white/10 py-6 shadow-2xl shadow-black/25 hover:shadow-3xl hover:shadow-black/40 transition-all duration-700 hover:-translate-y-2 hover:scale-[1.03] relative overflow-hidden before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-blue-500/5 before:via-purple-500/5 before:to-pink-500/5 before:pointer-events-none after:absolute after:inset-px after:rounded-3xl after:bg-gradient-to-br after:from-white/10 after:to-transparent after:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function GlassCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card/50 backdrop-blur-xl text-card-foreground flex flex-col gap-6 rounded-2xl border border-border py-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  FutureCard,
  GlassCard,
}
