import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/app-store';

export function MarkdownView() {
  const { markdown, updateMarkdown } = useAppStore();

  return (
    <div className="p-4 h-full">
      <Textarea
        value={markdown}
        onChange={(e) => updateMarkdown(e.target.value)}
        className="font-mono h-[calc(100vh-180px)] resize-none"
        placeholder="Enter your markdown here..."
      />
    </div>
  );
}
