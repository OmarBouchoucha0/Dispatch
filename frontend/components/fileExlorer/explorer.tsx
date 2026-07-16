"use client"

import { ChevronDown, ChevronRight, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Config, useConfigStore } from "@/store/config-store"
import { useState } from "react"

export type FileNode = {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

function buildTree(configs: Config[]): FileNode[] {
  if (!configs || !Array.isArray(configs)) return []

  const groups = new Map<string, FileNode>()

  for (const config of configs) {
    if (!groups.has(config.deviceName)) {
      groups.set(config.deviceName, {
        id: `folder-${config.deviceID}`,
        name: config.deviceName,
        type: "folder",
        children: [],
      })
    }

    const folder = groups.get(config.deviceName)!
    folder.children!.push({
      id: config.id,
      type: "file",
      name: config.name || `${config.deviceName}.json`,
    })
  }

  return [...groups.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((folder) => ({
      ...folder,
      children: folder.children!.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}

export function Explorer() {
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
            if (node.type === "file") {
              const selectedConfig = configs.find(
                (c) => c.id === node.id
              )

              if (selectedConfig) {
                openConfig(selectedConfig)
              }
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
  const [expanded, setExpanded] = useState(true)
  const isSelected = node.type === "file" && selectedPath === node.id

  if (node.type === "folder") {
    return (
      <div>
        <div
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-1 h-6 px-2 cursor-pointer rounded-none",
            "hover:bg-accent/50 transition-colors"
          )}
          style={{
            paddingLeft: `${depth * 20 + 8}px`,
          }}
        >
          {expanded ? (
            <ChevronDown className="!h-3 !w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="!h-3 !w-3 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">
            {node.name}
          </span>
        </div>
        {expanded && node.children?.map((child) => (
          <FileTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

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
        paddingLeft: `${depth * 20 + 8}px`,
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
