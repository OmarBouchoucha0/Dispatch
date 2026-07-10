import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Home() {
  return (
    <ResizablePanelGroup orientation="horizontal">

      <ResizablePanel
        defaultSize={200}
        minSize={100}
        collapsible={true}
        collapsedSize={0}
        className="bg-sidebar"
      >
        File Explorer
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={500}
      >
        Editor
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
