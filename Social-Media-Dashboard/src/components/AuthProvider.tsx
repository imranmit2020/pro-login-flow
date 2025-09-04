"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from 'react'
import { useLightTheme } from "@/hooks/useLightTheme"

export function AuthProvider({ children }: { children: ReactNode }) {
  // Enforce light theme at the provider level
  useLightTheme();
  
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
} 