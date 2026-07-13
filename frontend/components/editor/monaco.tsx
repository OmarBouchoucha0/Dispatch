"use client"

import { useEffect } from "react"
import Editor, { useMonaco, OnMount } from "@monaco-editor/react"

type CodeEditorProps = {
  language: string
  value: string
  onChange?: (value: string) => void
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const monaco = useMonaco()

  const handleMount: OnMount = (editor, monacoInstance) => {
    editor.updateOptions({ contextmenu: false })

    editor.onContextMenu((e) => {
      e.event.browserEvent.preventDefault()
      e.event.browserEvent.stopPropagation()
    })

    editor.getDomNode()?.addEventListener("contextmenu", (domEvent) => {
      domEvent.preventDefault()
    })

    const commandPaletteAction = editor.getAction("editor.action.quickCommand")
      ; (commandPaletteAction as { dispose?: () => void } | null)?.dispose?.()

    editor.addCommand(monacoInstance.KeyCode.F1, () => { })
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyP,
      () => { }
    )
  }

  useEffect(() => {
    if (!monaco) return

    monaco.editor.defineTheme("vscode-dark-2026", {
      base: "vs-dark",
      inherit: false,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "keyword", foreground: "569CD6" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#121314",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2A2D2E",
        "editor.lineHighlightBorder": "#00000000",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#C6C6C6",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorIndentGuide.background": "#404040",
        "editorIndentGuide.activeBackground": "#707070",
        "editorBracketHighlight.foreground1": "#FFD700",
        "editorBracketHighlight.foreground2": "#DA70D6",
        "editorBracketHighlight.foreground3": "#179FFF",
        "editor.findMatchBackground": "#515C6A",
        "editor.findMatchHighlightBackground": "#3A3D41",
        "scrollbarSlider.background": "#79797966",
        "scrollbarSlider.hoverBackground": "#646464B3",
        "scrollbarSlider.activeBackground": "#BFBFBF66",
        "editorSuggestWidget.background": "#252526",
        "editorSuggestWidget.border": "#454545",
        "editorSuggestWidget.selectedBackground": "#04395E",
        "editorSuggestWidget.foreground": "#D4D4D4",
        "editorHoverWidget.background": "#252526",
        "editorHoverWidget.border": "#454545",
        "peekViewEditor.background": "#1F1F1F",
        "peekViewResult.background": "#252526",
      },
    })
    monaco.editor.setTheme("vscode-dark-2026")
  }, [monaco])

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="vscode-dark-2026"
      onChange={(v) => onChange?.(v ?? "")}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "JetBrains Mono",
        wordWrap: "on",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        renderLineHighlight: "line",
        padding: { top: 12, bottom: 12 },
      }}
    />
  )
}
