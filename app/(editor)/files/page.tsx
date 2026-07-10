import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Editor } from "@/components/editor/editor"

export default function Home() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="bg-sidebar">

      <ResizablePanel
        defaultSize={200}
        minSize={100}
        collapsible={true}
        collapsedSize={0}
        className="bg-sidebar"
      >
        <h1 className="p-2 text-xs">Explorer</h1>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={500}
      >
        <Editor />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
