import {
  FileCode,
  FileJson,
  FileText,
  FileImage,
  File,
  type LucideIcon,
  Terminal,
  Database,
  Braces,
  Globe,
  Paintbrush,
  BookOpen,
  Settings,
  Hash,
  FileType,
  FileSpreadsheet,
  FileArchive,
} from 'lucide-react';

export interface FileTypeInfo {
  icon: LucideIcon;
  color: string;
  language: string;
}

const extensionMap: Record<string, FileTypeInfo> = {
  // JavaScript/TypeScript
  '.js': { icon: FileCode, color: '#f7df1e', language: 'javascript' },
  '.jsx': { icon: FileCode, color: '#61dafb', language: 'jsx' },
  '.ts': { icon: Braces, color: '#3178c6', language: 'typescript' },
  '.tsx': { icon: Braces, color: '#3178c6', language: 'tsx' },
  '.mjs': { icon: FileCode, color: '#f7df1e', language: 'javascript' },
  '.cjs': { icon: FileCode, color: '#f7df1e', language: 'javascript' },
  '.d.ts': { icon: Braces, color: '#3178c6', language: 'typescript' },

  // Web
  '.html': { icon: Globe, color: '#e34f26', language: 'html' },
  '.htm': { icon: Globe, color: '#e34f26', language: 'html' },
  '.css': { icon: Paintbrush, color: '#1572b6', language: 'css' },
  '.scss': { icon: Paintbrush, color: '#cc6699', language: 'scss' },
  '.sass': { icon: Paintbrush, color: '#cc6699', language: 'sass' },
  '.less': { icon: Paintbrush, color: '#1d365d', language: 'less' },

  // Python
  '.py': { icon: Terminal, color: '#3776ab', language: 'python' },
  '.pyc': { icon: Terminal, color: '#3776ab', language: 'python' },
  '.pyx': { icon: Terminal, color: '#3776ab', language: 'python' },

  // Go
  '.go': { icon: Terminal, color: '#00add8', language: 'go' },
  '.mod': { icon: FileCode, color: '#00add8', language: 'go' },

  // Rust
  '.rs': { icon: Terminal, color: '#dea584', language: 'rust' },
  '.toml': { icon: Settings, color: '#dea584', language: 'toml' },

  // Java
  '.java': { icon: FileCode, color: '#b07219', language: 'java' },
  '.kt': { icon: FileCode, color: '#7f52ff', language: 'kotlin' },
  '.kts': { icon: FileCode, color: '#7f52ff', language: 'kotlin' },

  // C/C++
  '.c': { icon: FileCode, color: '#555555', language: 'c' },
  '.h': { icon: FileCode, color: '#555555', language: 'c' },
  '.cpp': { icon: FileCode, color: '#f34b7d', language: 'cpp' },
  '.hpp': { icon: FileCode, color: '#f34b7d', language: 'cpp' },
  '.cs': { icon: FileCode, color: '#178600', language: 'csharp' },

  // Ruby
  '.rb': { icon: FileCode, color: '#701516', language: 'ruby' },
  '.erb': { icon: FileCode, color: '#701516', language: 'erb' },

  // PHP
  '.php': { icon: FileCode, color: '#777bb4', language: 'php' },

  // Shell
  '.sh': { icon: Terminal, color: '#89e051', language: 'shell' },
  '.bash': { icon: Terminal, color: '#89e051', language: 'shell' },
  '.zsh': { icon: Terminal, color: '#89e051', language: 'shell' },
  '.ps1': { icon: Terminal, color: '#012456', language: 'powershell' },
  '.bat': { icon: Terminal, color: '#c1f12e', language: 'bat' },

  // Config
  '.json': { icon: FileJson, color: '#292929', language: 'json' },
  '.yaml': { icon: Settings, color: '#6c6c6c', language: 'yaml' },
  '.yml': { icon: Settings, color: '#6c6c6c', language: 'yaml' },
  '.xml': { icon: FileCode, color: '#0060ac', language: 'xml' },
  '.env': { icon: Settings, color: '#faca39', language: 'dotenv' },
  '.editorconfig': { icon: Settings, color: '#faca39', language: 'ini' },

  // Markdown/Docs
  '.md': { icon: BookOpen, color: '#083fa1', language: 'markdown' },
  '.mdx': { icon: BookOpen, color: '#083fa1', language: 'mdx' },
  '.txt': { icon: FileText, color: '#6c6c6c', language: 'text' },
  '.rst': { icon: FileText, color: '#6c6c6c', language: 'rst' },

  // Data
  '.csv': { icon: FileSpreadsheet, color: '#217346', language: 'csv' },
  '.sql': { icon: Database, color: '#e38c00', language: 'sql' },
  '.graphql': { icon: Hash, color: '#e10098', language: 'graphql' },
  '.gql': { icon: Hash, color: '#e10098', language: 'graphql' },

  // Docker
  'dockerfile': { icon: Terminal, color: '#2496ed', language: 'docker' },
  '.dockerfile': { icon: Terminal, color: '#2496ed', language: 'docker' },

  // Images
  '.png': { icon: FileImage, color: '#6c6c6c', language: 'image' },
  '.jpg': { icon: FileImage, color: '#6c6c6c', language: 'image' },
  '.jpeg': { icon: FileImage, color: '#6c6c6c', language: 'image' },
  '.svg': { icon: FileImage, color: '#ffb13b', language: 'svg' },
  '.ico': { icon: FileImage, color: '#6c6c6c', language: 'image' },
  '.gif': { icon: FileImage, color: '#6c6c6c', language: 'image' },
  '.webp': { icon: FileImage, color: '#6c6c6c', language: 'image' },

  // Fonts
  '.woff': { icon: FileType, color: '#6c6c6c', language: 'font' },
  '.woff2': { icon: FileType, color: '#6c6c6c', language: 'font' },
  '.ttf': { icon: FileType, color: '#6c6c6c', language: 'font' },
  '.eot': { icon: FileType, color: '#6c6c6c', language: 'font' },

  // Archives
  '.zip': { icon: FileArchive, color: '#6c6c6c', language: 'archive' },
  '.tar': { icon: FileArchive, color: '#6c6c6c', language: 'archive' },
  '.gz': { icon: FileArchive, color: '#6c6c6c', language: 'archive' },

  // Lockfiles
  '.lock': { icon: FileCode, color: '#6c6c6c', language: 'text' },
  '.lockb': { icon: FileCode, color: '#6c6c6c', language: 'text' },

  // Makefile
  'makefile': { icon: Settings, color: '#427819', language: 'makefile' },

  // Git
  '.gitignore': { icon: Settings, color: '#f05032', language: 'gitignore' },
  '.gitattributes': { icon: Settings, color: '#f05032', language: 'gitignore' },
  '.gitmodules': { icon: Settings, color: '#f05032', language: 'gitignore' },
};

export const defaultFileInfo: FileTypeInfo = {
  icon: File,
  color: '#6c6c6c',
  language: 'text',
};

export function getFileInfo(filename: string): FileTypeInfo {
  const lower = filename.toLowerCase();

  if (extensionMap[lower]) return extensionMap[lower];

  const parts = lower.split('.');
  if (parts.length > 1) {
    const ext = `.${parts[parts.length - 1]}`;
    if (extensionMap[ext]) return extensionMap[ext];
    if (parts.length > 2) {
      const fullExt = `.${parts.slice(-2).join('.')}`;
      if (extensionMap[fullExt]) return extensionMap[fullExt];
    }
  }

  return defaultFileInfo;
}

export function getLanguageFromFilename(filename: string): string {
  return getFileInfo(filename).language;
}
