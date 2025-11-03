"use client"

import { useEffect } from "react"

export function PreventFOUC() {
  useEffect(() => {
    document.documentElement.classList.add("loaded")
    document.documentElement.style.visibility = "visible"
    document.documentElement.style.opacity = "1"
  }, [])

  return null
}

