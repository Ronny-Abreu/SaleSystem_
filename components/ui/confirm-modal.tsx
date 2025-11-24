"use client"

import { X } from "lucide-react"
import type React from "react"


interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonColor?: "red" | "blue"
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonColor = "red",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white border-2 border-black shadow-2xl w-full max-w-md mx-4 rounded-xl">
        {/* Close button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-black tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-gray-600 mb-8">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 py-3 px-6 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg whitespace-nowrap ${
                confirmButtonColor === "red"
                  ? "bg-black text-white hover:bg-red-600 disabled:hover:bg-black"
                  : "bg-black text-white hover:bg-blue-600 disabled:hover:bg-black"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2 whitespace-nowrap">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Procesando...</span>
                </span>
              ) : (
                confirmText
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-black text-black py-3 px-6 font-medium hover:border-blue-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-black disabled:hover:text-black rounded-lg whitespace-nowrap"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

