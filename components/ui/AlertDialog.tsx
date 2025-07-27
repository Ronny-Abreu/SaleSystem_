"use client"

import { X } from "lucide-react"
import { useEffect } from "react"

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export function AlertDialog({ isOpen, onClose, title, message }: AlertDialogProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <p className="text-slate-700 text-sm md:text-base">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  )
} 