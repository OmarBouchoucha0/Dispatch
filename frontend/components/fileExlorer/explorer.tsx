// components/editor/file-explorer.tsx
"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export type FileNode = {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

type FileExplorerProps = {
  tree: FileNode[]
  onFileSelect?: (path: string) => void
  selectedPath?: string
}

export function Explorer({ tree, onFileSelect, selectedPath }: FileExplorerProps) {
  return (
    <div className="text-xs select-none py-1">
      {tree.map((node) => (
        <FileTreeNode
          key={node.name}
          node={node}
          depth={0}
          path={node.name}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  )
}

type FileTreeNodeProps = {
  node: FileNode
  depth: number
  path: string
  onFileSelect?: (path: string) => void
  selectedPath?: string
}

function FileTreeNode({ node, depth, path, onFileSelect, selectedPath }: FileTreeNodeProps) {
  const [expanded, setExpanded] = React.useState(depth === 0)
  const isFolder = node.type === "folder"
  const isSelected = !isFolder && selectedPath === path

  const handleClick = () => {
    if (isFolder) {
      setExpanded((prev) => !prev)
    } else {
      onFileSelect?.(path)
    }
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 h-6 px-2  cursor-pointer rounded-none",
          "hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isFolder ? (
          <>
            <ChevronRight
              className={cn(
                "!h-3.5 !w-3.5 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90"
              )}
            />
            {expanded ? (
              <FolderOpen className="!h-3.5 !w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            ) : (
              <Folder className="!h-3.5 !w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className="!h-3.5 !w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          </>
        )}
        <span
          className={cn(
            "truncate",
            isSelected ? "text-accent-foreground" : "text-foreground/80"
          )}
        >
          {node.name}
        </span>
      </div>

      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.name}
              node={child}
              depth={depth + 1}
              path={`${path}/${child.name}`}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}
