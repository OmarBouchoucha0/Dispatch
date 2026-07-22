"use client"

import { useEffect } from "react"
import { loader } from "@monaco-editor/react"

export function MonacoPreloader() {
  useEffect(() => { loader.init() }, [])
  return null
}
