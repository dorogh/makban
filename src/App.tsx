import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { KanbanView } from '@/components/KanbanView';
import { MarkdownView } from '@/components/MarkdownView';
import { useAppStore } from '@/store/app-store';

function App() {
  const { view, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {view === 'kanban' ? <KanbanView /> : <MarkdownView />}
      </main>
    </div>
  );
}

export default App;
