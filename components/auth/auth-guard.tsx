"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "./login-modal"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const blurClass = !isAuthenticated ? "filter blur-sm brightness-50 pointer-events-none" : "";

  return (
    <>
      <div className={blurClass}>
        {children}
      </div>
      {!isAuthenticated && <LoginModal isOpen={true} />}
    </>
  )
}
