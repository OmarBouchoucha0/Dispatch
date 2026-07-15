"use client"

import { File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Config, useConfigStore } from "@/store/config-store"

export type FileNode = {
  id: string
  name: string
  type: "file"
}

function buildTree(configs: Config[]): FileNode[] {
  return configs
    .map((config) => ({
      id: config.id,
      name: `${config.deviceName}.json`,
      type: "file",
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

type FileExplorerProps = {
  onFileSelect?: (id: string) => void
}

export function Explorer({
  onFileSelect,
}: FileExplorerProps) {
  const configs = useConfigStore(
    (state) => state.configs
  )
  const activeConfig = useConfigStore(
    (state) => state.activeConfig
  )

  const openConfig = useConfigStore(
    (state) => state.openConfig
  )
  const tree = buildTree(configs)

  return (
    <div className="text-xs select-none py-1">
      {tree.map((node) => (
        <FileTreeNode
          key={node.id}
          node={node}
          depth={0}
          onSelect={(node) => {
            const config = configs.find(
              (c) => c.id === node.id
            )

            if (config) {
              openConfig(config)
            }
          }}
          selectedPath={activeConfig ?? undefined}
        />
      ))}
    </div>
  )
}


type FileTreeNodeProps = {
  node: FileNode
  depth: number
  selectedPath?: string
  onSelect: (node: FileNode) => void
}


function FileTreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: FileTreeNodeProps) {
  const isSelected = selectedPath === node.id

  return (
    <div
      onClick={() => onSelect(node)}
      className={cn(
        "flex items-center gap-1 h-6 px-2 cursor-pointer rounded-none",
        "hover:bg-accent/50 transition-colors",
        isSelected &&
        "bg-accent text-accent-foreground"
      )}
      style={{
        paddingLeft: `${depth * 14 + 8}px`,
      }}
    >
      <File
        className="!h-3.5 !w-3.5 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
      />

      <span
        className={cn(
          "truncate",
          isSelected
            ? "text-accent-foreground"
            : "text-foreground/80"
        )}
      >
        {node.name}
      </span>
    </div>
  )
}
