"use client"

import { useMemo, useState } from "react"
import { MultiFileDiff } from "@pierre/diffs/react"
import { cn } from "@/lib/utils"
import { useDeviceStore } from "@/store/device-store"
import { useConfigStore } from "@/store/config-store"
import { useTheme } from "next-themes"
import type {
  ConfigSnapshotItem,
  DeviceSnapshotItem,
} from "@/store/events-store"
import { ChevronDown, ChevronRight } from "lucide-react"

type EventDiffProps = {
  configsBefore: ConfigSnapshotItem[]
  configsAfter: ConfigSnapshotItem[]
  devicesBefore: DeviceSnapshotItem[]
  devicesAfter: DeviceSnapshotItem[]
}

type DiffFile = {
  key: string
  deviceID: string
  deviceName: string | undefined
  name: string
  oldContent: string
  newContent: string
  changeType: "changed" | "added" | "removed"
}

type TreeNode = {
  id: string
  name: string
  type: "folder" | "file"
  children?: TreeNode[]
}

function normalizeContent(obj: unknown): string {
  if (obj === null || obj === undefined) return ""
  return JSON.stringify(deepSortKeys(obj), null, 2)
}

function deepSortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deepSortKeys)
  }
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = deepSortKeys((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}

export function EventDiff({
  configsBefore,
  configsAfter,
  devicesBefore,
  devicesAfter,
}: EventDiffProps) {
  const devices = useDeviceStore((s) => s.devices)
  const deployedConfigs = useConfigStore((s) => s.configs)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()

  const effectiveBefore = useMemo(() => {
    if (configsBefore.length > 0) return configsBefore
    return deployedConfigs.map((c) => ({
      device_id: c.device_id,
      name: c.name,
      content: (c.content ?? {}) as Record<string, unknown>,
    }))
  }, [configsBefore, deployedConfigs])

  const diffFiles = useMemo(() => {
    const beforeMap = new Map<string, ConfigSnapshotItem>()
    const afterMap = new Map<string, ConfigSnapshotItem>()

    for (const item of effectiveBefore) {
      beforeMap.set(`${item.device_id}::${item.name}`, item)
    }
    for (const item of configsAfter) {
      afterMap.set(`${item.device_id}::${item.name}`, item)
    }

    const allKeys = new Set([...beforeMap.keys(), ...afterMap.keys()])
    const files: DiffFile[] = []

    for (const key of allKeys) {
      const before = beforeMap.get(key)
      const after = afterMap.get(key)

      if (before && after) {
        const oldStr = normalizeContent(before.content)
        const newStr = normalizeContent(after.content)
        if (oldStr !== newStr) {
          files.push({
            key,
            deviceID: before.device_id,
            deviceName: after.device_name ?? before.device_name,
            name: before.name,
            oldContent: oldStr,
            newContent: newStr,
            changeType: "changed",
          })
        }
      } else if (before && !after) {
        files.push({
            key,
            deviceID: before.device_id,
            deviceName: before.device_name,
            name: before.name,
            oldContent: normalizeContent(before.content),
            newContent: "",
            changeType: "removed",
          })
      } else if (after && !before) {
        files.push({
            key,
            deviceID: after.device_id,
            deviceName: after.device_name,
            name: after.name,
            oldContent: "",
            newContent: normalizeContent(after.content),
            changeType: "added",
          })
      }
    }

    return files
  }, [effectiveBefore, configsAfter])

  const tree = useMemo(() => {
    const folderMap = new Map<string, TreeNode>()

    for (const file of diffFiles) {
      const device = devices.find((d) => d.id === file.deviceID)
      const deviceName = device?.name ?? file.deviceName ?? file.deviceID ?? "Unknown Device"

      if (!folderMap.has(deviceName)) {
        folderMap.set(deviceName, {
          id: `folder-${deviceName}`,
          name: deviceName,
          type: "folder",
          children: [],
        })
      }

      folderMap.get(deviceName)!.children!.push({
        id: file.key,
        name: file.name,
        type: "file",
      })
    }

    return [...folderMap.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => ({
        ...folder,
        children: folder.children!.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }))
  }, [diffFiles, devices])

  const effectiveSelectedKey =
    selectedKey ?? diffFiles[0]?.key ?? null
  const selectedFile = effectiveSelectedKey
    ? diffFiles.find((f) => f.key === effectiveSelectedKey) ?? null
    : null

  const changedCount = diffFiles.filter(
    (f) => f.changeType === "changed"
  ).length
  const addedCount = diffFiles.filter(
    (f) => f.changeType === "added"
  ).length
  const removedCount = diffFiles.filter(
    (f) => f.changeType === "removed"
  ).length

  const diffFile =
    selectedFile && effectiveSelectedKey
      ? {
          oldFile: {
            name: selectedFile.name,
            contents: selectedFile.oldContent,
            lang: "json" as const,
          },
          newFile: {
            name: selectedFile.name,
            contents: selectedFile.newContent,
            lang: "json" as const,
          },
        }
      : null

  if (diffFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No config changes in this event
      </div>
    )
  }

  return (
    <div className="flex h-full gap-0">
      <div className="w-44 shrink-0 overflow-y-auto border-r border-border text-xs select-none py-1 bg-sidebar">
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explorer
        </div>
        {tree.length === 0 ? (
          <div className="px-3 py-2 text-muted-foreground italic">
            No changes
          </div>
        ) : (
          tree.map((node) => (
            <DiffTreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedKey={effectiveSelectedKey}
              onSelect={setSelectedKey}
              diffFiles={diffFiles}
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
  node: TreeNode
  depth: number
  selectedKey: string | null
  onSelect: (key: string) => void
  diffFiles: DiffFile[]
}

function DiffTreeNode({
  node,
  depth,
  selectedKey,
  onSelect,
  diffFiles,
}: DiffTreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const isSelected = node.type === "file" && selectedKey === node.id
  const file = node.type === "file"
    ? diffFiles.find((f) => f.key === node.id)
    : null
  const isAdded = file?.changeType === "added"
  const isRemoved = file?.changeType === "removed"

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
              selectedKey={selectedKey}
              onSelect={onSelect}
              diffFiles={diffFiles}
            />
          ))}
      </div>
    )
  }

  const textColor = isAdded
    ? "text-[#5ecc71]"
    : isRemoved
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
        isSelected && "bg-accent"
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
    >
      <span className={cn("truncate", textColor)}>{node.name}</span>
    </div>
  )
}
