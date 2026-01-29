const STORAGE_KEY = 'markdown';

export function saveMarkdown(content: string): void {
  localStorage.setItem(STORAGE_KEY, content);
}

export function loadMarkdown(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearMarkdown(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportMarkdown(content: string, filename: string = 'kanban.md'): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importMarkdown(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
