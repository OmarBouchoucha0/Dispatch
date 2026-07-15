import { CodeEditor } from "@/components/editor/monaco"
import { useEditorStore } from "@/store/editor-store"

export function ConfigEditor({ configId }: { configId: string }) {
  const updateFile = useEditorStore(
    (state) => state.updateFile
  )

  const editorFile = useEditorStore(
    (state) => state.files[configId]
  )

  return (
    <CodeEditor
      language="json"
      value={editorFile?.content ?? ""}
      onChange={(value) =>
        updateFile(configId, value)
      }
    />
  )
}
