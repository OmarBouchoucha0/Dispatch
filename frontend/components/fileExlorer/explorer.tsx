"use client"

import { ChevronDown, ChevronRight, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Config, useConfigStore } from "@/store/config-store"
import { Device, useDeviceStore } from "@/store/device-store"
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

function buildTree(configs: Config[], devices: Device[]): FileNode[] {
  const folderMap = new Map<string, FileNode>()

  for (const device of devices) {
    folderMap.set(device.id, {
      id: `folder-${device.id}`,
      name: device.name,
      type: "folder",
      children: [],
    })
  }

  for (const config of configs) {
    if (!folderMap.has(config.deviceID)) {
      folderMap.set(config.deviceID, {
        id: `folder-${config.deviceID}`,
        name: config.deviceName,
        type: "folder",
        children: [],
      })
    }

    const folder = folderMap.get(config.deviceID)!
    folder.children!.push({
      id: config.id,
      type: "file",
      name: config.name || `${config.deviceName}.json`,
    })
  }

  return [...folderMap.values()]
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
  const devices = useDeviceStore(
    (state) => state.devices
  )
  const pendingDeviceName = useDeviceStore(
    (state) => state.pendingDeviceName
  )
  const setPendingDeviceName = useDeviceStore(
    (state) => state.setPendingDeviceName
  )
  const createDevice = useDeviceStore(
    (state) => state.createDevice
  )
  const tree = buildTree(configs, devices)

  return (
    <div className="text-xs select-none py-1">
      {pendingDeviceName !== null && (
        <DeviceCreateRow
          onCreate={(name) => {
            createDevice(name)
            setPendingDeviceName(null)
          }}
          onCancel={() => setPendingDeviceName(null)}
        />
      )}
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
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const isSelected = node.type === "file" && selectedPath === node.id
  const renameConfig = useConfigStore((state) => state.renameConfig)
  const deleteConfig = useConfigStore((state) => state.deleteConfig)
  const createConfig = useConfigStore((state) => state.createConfig)

  useEffect(() => {
    if (!isEditing) return

    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [isEditing])

  useEffect(() => {
    if (!isCreating) return

    requestAnimationFrame(() => {
      newFileInputRef.current?.focus()
    })
  }, [isCreating])

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

  function handleCreateFile() {
    const trimmed = newFileName.trim()
    if (!trimmed) {
      setIsCreating(false)
      return
    }

    const deviceID = node.id.replace("folder-", "")
    setIsCreating(false)
    createConfig(deviceID, node.name, trimmed)
  }

  function handleNewFileKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleCreateFile()
    } else if (e.key === "Escape") {
      setIsCreating(false)
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
                    setIsCreating(true)
                    setExpanded(true)
                    setNewFileName("")
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
            {isCreating && (
              <div
                className="flex items-center gap-1 h-6 pr-2"
                style={{
                  paddingLeft: `${(depth + 1) * 20 + 8}px`,
                }}
              >

                <File
                  className="!h-3.5 !w-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <Input
                  ref={newFileInputRef}
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={handleCreateFile}
                  onKeyDown={handleNewFileKeyDown}
                  className="h-6 w-full px-0 py-0 border-none rounded-none !bg-transparent !text-xs text-foreground/80 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
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

type DeviceCreateRowProps = {
  onCreate: (name: string) => void
  onCancel: () => void
}

function DeviceCreateRow({
  onCreate,
  onCancel,
}: DeviceCreateRowProps) {
  const [name, setName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      onCancel()
      return
    }
    onCreate(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <div className="group flex items-center gap-1 h-6 pl-2 cursor-pointer rounded-none">
      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
      <div className="flex items-center justify-between w-full">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          placeholder="device name"
          className="h-6 w-full px-0 py-0 border-none rounded-none !bg-transparent !text-xs text-foreground/80 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  )
}
