"use client"

import { useEffect } from "react"
import { Check, X } from "lucide-react"

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  type?: "success" | "error"
  duration?: number
}

export function Toast({ message, isVisible, onClose, type = "success", duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
          type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        }`}
      >
        <div
          className={`flex-shrink-0 ${
            type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "success" ? <Check size={20} /> : <X size={20} />}
        </div>
        <p
          className={`text-sm font-medium ${
            type === "success" ? "text-green-800" : "text-red-800"
          }`}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className={`ml-2 flex-shrink-0 ${
            type === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

