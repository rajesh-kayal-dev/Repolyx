'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronRight, Folder, FolderOpen, File as FileIcon } from 'lucide-react';
import { getFileInfo } from '@/lib/file-types';
import type { TreeNode, RepositoryFile } from '@/lib/types';

interface FileTreeProps {
  tree: TreeNode[];
  files: RepositoryFile[];
  selectedFile: RepositoryFile | null;
  onFileSelect: (file: RepositoryFile) => void;
  collapsedFolders: Record<string, boolean>;
  onToggleFolder: (path: string) => void;
  fileSearchQuery: string;
  onSearchChange: (query: string) => void;
  onScanClick: () => void;
  isIndexed: boolean;
}

export function FileTree({
  tree,
  files,
  selectedFile,
  onFileSelect,
  collapsedFolders,
  onToggleFolder,
  fileSearchQuery,
  onSearchChange,
  onScanClick,
  isIndexed,
}: FileTreeProps) {
  const filterNodes = (nodes: TreeNode[], query: string): TreeNode[] => {
    return nodes
      .map((node) => {
        if (node.type === 'directory') {
          const children = filterNodes(node.children || [], query);
          if (children.length > 0) return { ...node, children };
          return null;
        }
        if (node.name.toLowerCase().includes(query.toLowerCase())) return node;
        return null;
      })
      .filter(Boolean) as TreeNode[];
  };

  const renderNode = (node: TreeNode, depth: number) => {
    if (node.type === 'directory') {
      const isCollapsed = collapsedFolders[node.path];
      const filteredChildren = fileSearchQuery
        ? filterNodes(node.children || [], fileSearchQuery)
        : node.children || [];

      return (
        <div key={node.path}>
          <button
            onClick={() => onToggleFolder(node.path)}
            className="flex w-full items-center gap-1 rounded-none px-0 py-1 hover:bg-white/[0.03] transition-colors group text-left"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <ChevronRight
              size={11}
              className={`text-neutral-500 transition-transform shrink-0 ${!isCollapsed ? 'rotate-90' : ''}`}
            />
            {isCollapsed ? (
              <Folder size={13} className="text-accent/50 shrink-0" />
            ) : (
              <FolderOpen size={13} className="text-accent shrink-0" />
            )}
            <span className="text-[11px] font-medium text-neutral-300 truncate flex-1">{node.name}</span>
            <span className="text-[10px] text-neutral-600 pr-1">{filteredChildren.length}</span>
          </button>
          {!isCollapsed && filteredChildren.length > 0 && (
            <div>{filteredChildren.map((child) => renderNode(child, depth + 1))}</div>
          )}
        </div>
      );
    }

    const fileInfo = getFileInfo(node.name);
    const FileTypeIcon = fileInfo.icon;
    const isActive = selectedFile?.path === node.path;

    return (
      <button
        key={node.path}
        onClick={() => {
          const file = files.find((f) => f.path === node.path);
          if (file) onFileSelect(file);
        }}
        className={`flex w-full items-center gap-2 rounded-none px-0 py-1 text-[11px] text-left transition-colors ${
          isActive
            ? 'bg-accent/[0.08] text-accent font-medium border-l-[2px] border-accent'
            : 'text-neutral-400 hover:bg-white/[0.02] hover:text-neutral-200 border-l-[2px] border-transparent'
        }`}
        style={{ paddingLeft: `${depth * 16 + 28}px` }}
      >
        <FileTypeIcon size={12} className="shrink-0" style={{ color: fileInfo.color }} />
        <span className="truncate flex-1">{node.name}</span>
        {node.isImportant && (
          <span className="shrink-0 text-[9px] font-medium px-1 py-0.5 rounded-sm bg-accent/10 text-accent border border-accent/15">
            AI
          </span>
        )}
      </button>
    );
  };

  const displayTree = useMemo(() => {
    if (!fileSearchQuery) return tree;
    return filterNodes(tree, fileSearchQuery);
  }, [tree, fileSearchQuery]);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0d1117] overflow-hidden flex flex-col">
      <div className="sticky top-0 bg-[#0d1117] z-10 border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-1.5">
            <FolderOpen size={12} className="text-neutral-500" />
            <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Files</h2>
          </div>
          <span className="text-[10px] text-neutral-500 tabular-nums">{files.length}</span>
        </div>
        <div className="px-3 pb-2.5">
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="search"
              value={fileSearchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] py-1.5 pl-7 pr-2 text-[11px] text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-thin py-0.5">
        {displayTree.length > 0 ? (
          displayTree.map((node) => renderNode(node, 0))
        ) : (
          <div className="py-8 text-center px-3">
            {isIndexed ? (
              <p className="text-[10px] text-neutral-600">
                {fileSearchQuery ? 'No matching files' : 'No files found'}
              </p>
            ) : (
              <div>
                <p className="text-[10px] text-neutral-600 mb-2">Not yet scanned</p>
                <button
                  onClick={onScanClick}
                  className="text-[10px] text-accent hover:underline font-medium"
                >
                  Run scan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
