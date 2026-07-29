import type { Config } from "@/store/config-store"
import type { Device } from "@/store/device-store"

export type FileNode = {
  id: string
  name: string
  type: "file" | "folder"
  children?: FileNode[]
}

export function buildTree(configs: Config[], devices: Device[]): FileNode[] {
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
    if (!folderMap.has(config.device_id)) {
      folderMap.set(config.device_id, {
        id: `folder-${config.device_id}`,
        name: config.device_name,
        type: "folder",
        children: [],
      })
    }

    const folder = folderMap.get(config.device_id)!
    folder.children!.push({
      id: config.id,
      type: "file",
      name: config.name || `${config.device_name}.json`,
    })
  }

  return [...folderMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((folder) => ({
      ...folder,
      children: folder.children!.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}
