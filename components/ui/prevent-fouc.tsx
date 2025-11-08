"use client"

import { useEffect } from "react"

export function PreventFOUC() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body?.classList.add('loaded')
    }
  }, [])

  return null
}

