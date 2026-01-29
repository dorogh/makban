import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { exportMarkdown, importMarkdown } from '@/lib/storage';
import { ArrowLeftRight, Download, Upload, RotateCcw } from 'lucide-react';

export function Header() {
  const { title, view, setView, markdown, updateMarkdown, resetMarkdown } = useAppStore();

  const handleExport = () => {
    exportMarkdown(markdown, `${title.toLowerCase().replace(/\s+/g, '-')}.md`);
  };

  const handleImport = async () => {
    try {
      const content = await importMarkdown();
      updateMarkdown(content);
    } catch (error) {
      console.error('Failed to import markdown:', error);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the markdown to the default example?')) {
      resetMarkdown();
    }
  };

  const toggleView = () => {
    setView(view === 'kanban' ? 'markdown' : 'kanban');
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleView}
            title={`Switch to ${view === 'kanban' ? 'markdown' : 'kanban'} view`}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export markdown"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleImport}
            title="Import markdown"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Reset to example"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
