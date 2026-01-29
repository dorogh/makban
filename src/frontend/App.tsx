import { useEffect } from "react";
import { Header } from "@/components/Header";
import { KanbanView } from "@/components/KanbanView";
import { MarkdownView } from "@/components/MarkdownView";
import { useAppStore } from "@/store/app-store";
import { Button } from "./components/ui/button";

function App() {
  const { view, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-crosses-sparse">
      <Header />
      <Button>Click me</Button>
      <Button variant="secondary">Click me</Button>
      <Button variant="destructive">Click me</Button>
      <Button variant="outline">Click me</Button>
      <Button variant="ghost">Click me</Button>
      <Button variant="link">Click me</Button>
      <main>{view === "kanban" ? <KanbanView /> : <MarkdownView />}</main>
    </div>
  );
}

export default App;
