"use client"

import { useState } from "react"
import { MultiFileDiff } from "@pierre/diffs/react"
import { cn } from "@/lib/utils"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useCommitStore } from "@/store/commit-store"
import { buildTree } from "@/lib/build-tree"
import { useTheme } from "next-themes"
import type { FileNode } from "@/lib/build-tree"
import { ChevronDown, ChevronRight } from "lucide-react"

export function Diff() {
  const configs = useConfigStore((s) => s.configs)
  const devices = useDeviceStore((s) => s.devices)
  const snapshots = useCommitStore((s) => s.snapshots)
  const changedFiles = useCommitStore((s) => s.changedFiles)
  const deletedFiles = useCommitStore((s) => s.deletedFiles)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()


  const deletedItems = Object.values(deletedFiles).map((d) => ({
    id: d.id,
    deviceID: d.deviceID,
    deviceName: d.deviceName,
    name: d.name,
    content: null,
  }))

  const changedConfigs = configs.filter((c) => c.id in changedFiles)
  const treeItems = [...changedConfigs, ...deletedItems]
  const tree = buildTree(treeItems, devices).filter(
    (folder) => folder.children && folder.children.length > 0
  )

  const effectiveSelectedId = selectedId ?? tree[0]?.children?.[0]?.id ?? null

  function getContent(id: string) {
    const isDeleted = id in deletedFiles
    const isChanged = id in changedFiles
    const snapshot = snapshots[id] ?? ""

    let oldContent = snapshot
    let newContent = ""

    if (isDeleted) {
      oldContent = deletedFiles[id].content
      newContent = ""
    } else if (isChanged) {
      oldContent = snapshot
      newContent = changedFiles[id]
    }

    return { oldContent, newContent, isDeleted }
  }

  const selectedFile = effectiveSelectedId ? getContent(effectiveSelectedId) : null

  const selectedName = effectiveSelectedId
    ? deletedFiles[effectiveSelectedId]?.name ??
    configs.find((c) => c.id === effectiveSelectedId)?.name ??
    effectiveSelectedId
    : null

  const diffFile = selectedFile && selectedName
    ? {
      oldFile: {
        name: selectedName,
        contents: selectedFile.oldContent,
        lang: "json",
      },
      newFile: {
        name: selectedName,
        contents: selectedFile.newContent,
        lang: "json",
      },
    }
    : null

  const newFiles = new Set(
    Object.keys(changedFiles).filter((id) => !(id in snapshots))
  )
  const changedCount = Object.keys(changedFiles).length
  const deletedCount = Object.keys(deletedFiles).length

  return (
    <div className="flex h-full gap-0">
      <div className="w-44 shrink-0 overflow-y-auto border-r border-border text-xs select-none py-1">
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explorer
        </div>
        {changedCount === 0 && deletedCount === 0 ? (
          <div className="px-3 py-2 text-muted-foreground italic">
            No changes to commit
          </div>
        ) : (
          tree.map((node) => (
            <DiffTreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={setSelectedId}
              deletedFiles={deletedFiles}
              newFiles={newFiles}
            />
          ))
        )}
      </div>
      <div className="flex-1 min-w-0">
        {diffFile && selectedFile ? (
          <MultiFileDiff
            oldFile={diffFile.oldFile}
            newFile={diffFile.newFile}
            options={{
              theme: {
                dark: "pierre-dark",
                light: "pierre-light",
              },
              overflow: "wrap",
              themeType: resolvedTheme === "dark" ? "dark" : "light",
            }}
            style={{
              height: "100%",
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a file to view diff
          </div>
        )}
      </div>
    </div>
  )
}

type DiffTreeNodeProps = {
  node: FileNode
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  deletedFiles: Record<string, unknown>
  newFiles: Set<string>
}

function DiffTreeNode({ node, depth, selectedId, onSelect, deletedFiles, newFiles }: DiffTreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const isSelected = node.type === "file" && selectedId === node.id
  const isDeleted = node.type === "file" && node.id in deletedFiles
  const isNew = node.type === "file" && newFiles.has(node.id)

  if (node.type === "folder") {
    return (
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
          <span className="truncate text-foreground/80">{node.name}</span>
        </div>
        {expanded &&
          node.children?.map((child) => (
            <DiffTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              deletedFiles={deletedFiles}
              newFiles={newFiles}
            />
          ))}
      </div>
    )
  }


  const textColor =
    isNew
      ? "text-[#5ecc71]"
      : isDeleted
        ? "text-destructive"
        : isSelected
          ? "text-accent-foreground"
          : "text-foreground"

  return (
    <div
      onClick={() => onSelect(node.id)}
      className={cn(
        "flex items-center gap-1 h-6 px-2 cursor-pointer rounded-none",
        "hover:bg-accent/50 transition-colors",
        isSelected && "bg-accent",
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
    >
      <span className={cn("truncate", textColor)}>
        {node.name}
      </span>
    </div>
  )
}
