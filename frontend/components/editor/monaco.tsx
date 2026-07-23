"use client"

import { useEffect, useRef, useState } from "react"
import Editor, { OnMount, loader } from "@monaco-editor/react"
import { usePreferencesStore } from "@/store/preferences-store"
import { useUiStore } from "@/store/ui-store"
import { useTheme } from "next-themes"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import "@fontsource/jetbrains-mono"
import "@fontsource/fira-code"
import "@fontsource/source-code-pro"
import "@fontsource/iosevka"

// useMonaco from @monaco-editor/react has no .catch() on its cancelable promise
// (from @monaco-editor/loader's makeCancelable). When the component unmounts
// before Monaco finishes loading, the cleanup calls .cancel(), the promise rejects
// with { type: "cancelation", msg: "operation is manually canceled" }, and the
// unhandled rejection bubbles up as unhandledRejection. This wrapper handles it.
function useSafeMonaco() {
  const [monaco, setMonaco] = useState<Awaited<ReturnType<typeof loader.init>> | null>(null)

  useEffect(() => {
    let cancelled = false
    const loading = loader.init()
    loading.then((m) => {
      if (!cancelled) setMonaco(m)
    })
    loading.catch((e) => {
      if (e?.type !== "cancelation") {
        console.error("Monaco initialization error:", e)
      }
    })
    return () => { cancelled = true }
  }, [])

  return monaco
}

type CodeEditorProps = {
  language: string
  value: string
  onChange?: (value: string) => void
}

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const monaco = useSafeMonaco()
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const editorFont = usePreferencesStore((state) => state.editorFont)
  const editorFontSize = usePreferencesStore((state) => state.editorFontSize)
  const { resolvedTheme } = useTheme()
  const setEditorInstance = useUiStore((state) => state.setEditorInstance)

  useEffect(() => {
    return () => setEditorInstance(null)
  }, [setEditorInstance])

  const editorTheme = resolvedTheme === undefined || resolvedTheme === "dark"
    ? "vscode-dark-2026"
    : "vscode-light-2026"

  const handleMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor
    setEditorInstance(editor)
    editor.updateOptions({ contextmenu: false })

    const commandPaletteAction = editor.getAction("editor.action.quickCommand")
      ; (commandPaletteAction as { dispose?: () => void } | null)?.dispose?.()

    editor.addCommand(monacoInstance.KeyCode.F1, () => { })
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyP,
      () => { }
    )

    editor.addAction({
      id: "opencode.commandPalette",
      label: "Open Command Palette",
      keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyK],
      run: () => {
        const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore.getState()
        setCommandPaletteOpen(!commandPaletteOpen)
      },
    })
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

    monaco.editor.defineTheme("vscode-light-2026", {
      base: "vs",
      inherit: false,
      rules: [
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "string", foreground: "A31515" },
        { token: "number", foreground: "098658" },
        { token: "keyword", foreground: "0000FF" },
        { token: "type", foreground: "267F99" },
        { token: "function", foreground: "795E26" },
        { token: "variable", foreground: "001080" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#000000",
        "editorCursor.foreground": "#000000",
        "editor.lineHighlightBackground": "#E8E8E8",
        "editor.lineHighlightBorder": "#00000000",
        "editorLineNumber.foreground": "#999999",
        "editorLineNumber.activeForeground": "#333333",
        "editor.selectionBackground": "#ADD6FF",
        "editor.inactiveSelectionBackground": "#E5EBF1",
        "editorIndentGuide.background": "#D3D3D3",
        "editorIndentGuide.activeBackground": "#939393",
        "editorBracketHighlight.foreground1": "#0431FA",
        "editorBracketHighlight.foreground2": "#EF0083",
        "editorBracketHighlight.foreground3": "#179FFF",
        "editor.findMatchBackground": "#A8AC94",
        "editor.findMatchHighlightBackground": "#E2E2E2",
        "scrollbarSlider.background": "#64646466",
        "scrollbarSlider.hoverBackground": "#646464B3",
        "scrollbarSlider.activeBackground": "#BFBFBF66",
        "editorSuggestWidget.background": "#F3F3F3",
        "editorSuggestWidget.border": "#C5C5C5",
        "editorSuggestWidget.selectedBackground": "#D6EBFF",
        "editorSuggestWidget.foreground": "#000000",
        "editorHoverWidget.background": "#EFEFF2",
        "editorHoverWidget.border": "#C5C5C5",
        "peekViewEditor.background": "#F2F8FC",
        "peekViewResult.background": "#F2F8FC",
      },
    })

    monaco.editor.setTheme(editorTheme)
  }, [monaco, editorTheme])

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="h-full">
          <Editor
            height="100%"
            language={language}
            value={value}
            theme={editorTheme}
            onChange={(v) => onChange?.(v ?? "")}
            onMount={handleMount}
            options={{
              minimap: { enabled: false },
              fontSize: editorFontSize,
              fontFamily: `'${editorFont}', monospace`,
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderLineHighlight: "line",
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => editorRef.current?.trigger("context", "undo", null)}>
          Undo
          <ContextMenuShortcut className="pl-4">ctrl-z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => editorRef.current?.trigger("context", "redo", null)}>
          Redo
          <ContextMenuShortcut className="pl-4">ctrl-y</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={async () => {
          const editor = editorRef.current
          if (!editor) return
          const selection = editor.getSelection()
          if (!selection) return
          const text = editor.getModel()?.getValueInRange(selection)
          if (text) {
            await navigator.clipboard.writeText(text)
            editor.executeEdits("context", [
              { range: selection, text: "", forceMoveMarkers: true },
            ])
          }
        }}>
          Cut

          <ContextMenuShortcut className="pl-4">ctrl-x</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={async () => {
          const editor = editorRef.current
          if (!editor) return
          const selection = editor.getSelection()
          if (!selection) return
          const text = editor.getModel()?.getValueInRange(selection)
          if (text) await navigator.clipboard.writeText(text)
        }}>
          Copy
          <ContextMenuShortcut className="pl-4">ctrl-c</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={async () => {
          const editor = editorRef.current
          if (!editor) return
          const text = await navigator.clipboard.readText()
          if (!text) return
          const pos = editor.getPosition()!
          editor.executeEdits("context", [
            {
              range: {
                startLineNumber: pos.lineNumber, startColumn: pos.column,
                endLineNumber: pos.lineNumber, endColumn: pos.column,
              },
              text,
            },
          ])
        }}>
          Paste
          <ContextMenuShortcut className="pl-4">ctrl-v</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => editorRef.current?.trigger("context", "editor.action.selectAll", null)}>
          Select All
          <ContextMenuShortcut className="pl-4">ctrl-a</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => editorRef.current?.trigger("context", "editor.action.formatDocument", null)}>
          Format Code
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
