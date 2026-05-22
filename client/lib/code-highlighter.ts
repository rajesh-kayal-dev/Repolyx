let highlighterInstance: any = null;
let highlighterPromise: Promise<any> | null = null;

const BASE_LANGS = [
  'javascript', 'typescript', 'jsx', 'tsx', 'html', 'css',
  'python', 'go', 'rust', 'java', 'json', 'yaml', 'markdown',
  'bash', 'sql', 'xml', 'ruby', 'php', 'c', 'cpp', 'csharp',
  'text', 'shell', 'diff', 'dockerfile', 'graphql', 'prisma',
];

export async function getHighlighter() {
  if (highlighterInstance) return highlighterInstance;
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    try {
      const { createHighlighter } = await import('shiki');
      const highlighter = await createHighlighter({
        themes: ['github-dark'],
        langs: BASE_LANGS,
      });
      highlighterInstance = highlighter;
      return highlighter;
    } catch {
      highlighterInstance = null;
      return null;
    }
  })();

  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    if (!highlighter) return escapeHtml(code);
    const html = highlighter.codeToHtml(code, {
      lang: lang || 'text',
      theme: 'github-dark',
    });
    return html;
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
