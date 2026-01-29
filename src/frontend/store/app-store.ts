import { create } from 'zustand';
import { 
  parseMarkdown, 
  updateMarkdownItem, 
  moveItemInMarkdown,
  createExampleMarkdown,
  type MarkdownBucket 
} from '@/lib/markdown';
import { loadMarkdown, saveMarkdown } from '@/lib/storage';

type View = 'kanban' | 'markdown';

interface AppState {
  markdown: string;
  view: View;
  title: string;
  buckets: MarkdownBucket[];
  
  // Actions
  initialize: () => void;
  setView: (view: View) => void;
  updateMarkdown: (content: string) => void;
  moveItem: (itemLabel: string, fromBucket: string, toBucket: string) => void;
  updateItemLabel: (bucketName: string, oldLabel: string, newLabel: string) => void;
  resetMarkdown: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  markdown: '',
  view: 'kanban',
  title: '',
  buckets: [],

  initialize: () => {
    const stored = loadMarkdown();
    const content = stored || createExampleMarkdown();
    const parsed = parseMarkdown(content);
    
    // If no buckets, default to markdown view
    const initialView = parsed.buckets.length === 0 ? 'markdown' : 'kanban';
    
    set({
      markdown: content,
      title: parsed.title,
      buckets: parsed.buckets,
      view: initialView
    });
    
    if (!stored) {
      saveMarkdown(content);
    }
  },

  setView: (view) => set({ view }),

  updateMarkdown: (content) => {
    const parsed = parseMarkdown(content);
    set({
      markdown: content,
      title: parsed.title,
      buckets: parsed.buckets
    });
    saveMarkdown(content);
  },

  moveItem: (itemLabel, fromBucket, toBucket) => {
    const { markdown } = get();
    const isDoneBucket = toBucket.toLowerCase().includes('done');
    const updatedMarkdown = moveItemInMarkdown(
      markdown,
      fromBucket,
      toBucket,
      itemLabel,
      isDoneBucket
    );
    
    const parsed = parseMarkdown(updatedMarkdown);
    set({
      markdown: updatedMarkdown,
      buckets: parsed.buckets
    });
    saveMarkdown(updatedMarkdown);
  },

  updateItemLabel: (bucketName, oldLabel, newLabel) => {
    const { markdown } = get();
    const updatedMarkdown = updateMarkdownItem(
      markdown,
      bucketName,
      oldLabel,
      newLabel
    );
    
    const parsed = parseMarkdown(updatedMarkdown);
    set({
      markdown: updatedMarkdown,
      buckets: parsed.buckets
    });
    saveMarkdown(updatedMarkdown);
  },

  resetMarkdown: () => {
    const content = createExampleMarkdown();
    const parsed = parseMarkdown(content);
    set({
      markdown: content,
      title: parsed.title,
      buckets: parsed.buckets,
      view: 'kanban'
    });
    saveMarkdown(content);
  }
}));
