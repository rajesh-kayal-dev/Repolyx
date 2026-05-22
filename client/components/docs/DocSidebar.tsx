'use client';

import { motion } from 'framer-motion';
import {
  Building2,
  Route,
  Shield,
  Database,
  Puzzle,
  Settings,
  Rocket,
  FileText,
  BookOpen,
  GitBranch,
  FolderTree,
  Wand2,
} from 'lucide-react';

export interface DocSection {
  id: string;
  label: string;
  icon: typeof Building2;
  description: string;
  category?: 'core' | 'advanced' | 'ai';
}

export const DOC_SECTIONS: DocSection[] = [
  { id: 'readme', label: 'README Generator', icon: BookOpen, description: 'Auto-generated README with AI summary', category: 'core' },
  { id: 'api', label: 'API Documentation', icon: Route, description: 'Endpoints, routes, request/response formats', category: 'core' },
  { id: 'setup', label: 'Setup Guide', icon: FileText, description: 'Installation, prerequisites, env setup', category: 'core' },
  { id: 'architecture', label: 'Architecture Summary', icon: Building2, description: 'Project structure, tech stack, organization', category: 'core' },
  { id: 'changelog', label: 'Changelog', icon: GitBranch, description: 'Version history and change tracking', category: 'core' },
  { id: 'endpoint-docs', label: 'Endpoint Docs', icon: Route, description: 'Detailed API endpoint reference', category: 'advanced' },
  { id: 'environment', label: 'Environment Docs', icon: Settings, description: 'Config, env vars, and settings', category: 'advanced' },
  { id: 'database', label: 'Database Schema', icon: Database, description: 'Schema, models, migrations, and queries', category: 'advanced' },
  { id: 'auth', label: 'Authentication Flow', icon: Shield, description: 'Auth flows, security, and access control', category: 'advanced' },
  { id: 'deployment', label: 'Deployment Guide', icon: Rocket, description: 'CI/CD, Docker, and hosting config', category: 'advanced' },
  { id: 'folder-structure', label: 'Folder Structure', icon: FolderTree, description: 'Directory layout and organization', category: 'advanced' },
  { id: 'ai-suggestions', label: 'AI Suggestions', icon: Wand2, description: 'Smart recommendations for missing docs', category: 'ai' },
];

interface DocSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  hasData: Record<string, boolean>;
  loading: boolean;
  repoName?: string;
  missingCount?: number;
}

export function DocSidebar({ activeSection, onSectionChange, hasData, loading, repoName, missingCount }: DocSidebarProps) {
  const categories = [
    { key: 'core', label: 'Core Docs' },
    { key: 'advanced', label: 'Advanced' },
    { key: 'ai', label: 'AI Features' },
  ] as const;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] overflow-hidden">
      {repoName && (
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.1em]">Repository</p>
          <p className="text-sm text-white font-medium truncate mt-1">{repoName}</p>
        </div>
      )}

      <div className="p-3 space-y-4">
        {categories.map(({ key, label }) => {
          const sections = DOC_SECTIONS.filter((s) => s.category === key);
          return (
            <div key={key}>
              <p className="text-[10px] text-neutral-600 uppercase tracking-[0.1em] font-medium px-2 mb-1">{label}</p>
              <div className="space-y-0.5">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const hasContent = hasData[section.id];
                  const isMissing = section.id === 'ai-suggestions' && (missingCount ?? 0) > 0;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => onSectionChange(section.id)}
                      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-emerald-400"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon size={14} className="shrink-0" />
                      <span className="truncate">{section.label}</span>
                      {isMissing && (
                        <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full">
                          {missingCount}
                        </span>
                      )}
                      {!isMissing && loading && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neutral-600 animate-pulse shrink-0" />
                      )}
                      {!isMissing && !loading && hasContent && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
