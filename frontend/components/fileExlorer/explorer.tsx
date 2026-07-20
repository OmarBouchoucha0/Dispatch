"use client"

import { ChevronDown, ChevronRight, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Config, useConfigStore } from "@/store/config-store"
import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu"

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
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(node.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSelected = node.type === "file" && selectedPath === node.id
  const renameConfig = useConfigStore((state) => state.renameConfig)
  const deleteConfig = useConfigStore((state) => state.deleteConfig)

  useEffect(() => {
    if (!isEditing) return

    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [isEditing])

  function startEditing() {
    setEditValue(node.name)
    setIsEditing(true)
  }

  function commitRename() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== node.name) {
      renameConfig(node.id, trimmed)
    }
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      commitRename()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  if (node.type === "folder") {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div>
            <div
              onClick={() => setExpanded(!expanded)}
              className="group flex items-center gap-1 h-6 pl-2 cursor-pointer rounded-none"
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}

              <div className="flex items-center justify-between w-full">
                {isEditing ? (
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={handleKeyDown}
                    className=" h-6 w-full px-0 py-0 border-none rounded-none !bg-transparent !text-xs  shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                ) : (
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
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 px-3 opacity-0 hover:!text-primary-foreground transition-opacity duration-10 hover:!bg-transparent group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Plus className="h-3 w-3 " />
                </Button>
              </div>
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

        </ContextMenuTrigger>
        <ContextMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <ContextMenuItem onSelect={() => startEditing()}>Rename Device</ContextMenuItem>
          <ContextMenuItem variant="destructive" onSelect={() => deleteConfig(node.id)}>Delete Device</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
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

          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className=" h-6 w-full px-0 py-0 border-none rounded-none !bg-transparent !text-xs text-foreground/80 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 "
            />
          ) : (
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
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <ContextMenuItem onSelect={() => startEditing()}>Rename File</ContextMenuItem>
        <ContextMenuItem variant="destructive" onSelect={() => deleteConfig(node.id)}>Delete File</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
