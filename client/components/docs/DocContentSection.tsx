'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  AlertTriangle,
  Info,
  Shield,
  Database,
  Route,
  Puzzle,
  Rocket,
} from 'lucide-react';

function renderMarkdown(text: string): string {
  let html = text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-white mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/[0.06] text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-neutral-400 text-sm ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-neutral-400 leading-relaxed mb-3">');
  html = '<p class="text-sm text-neutral-400 leading-relaxed mb-3">' + html + '</p>';
  return html;
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.02] transition-colors"
      >
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FileListProps {
  files: { path: string; purpose: string }[];
  title?: string;
}

function FileList({ files, title = 'Files' }: FileListProps) {
  if (!files || files.length === 0) return null;
  return (
    <Collapsible title={`${title} (${files.length})`}>
      <div className="space-y-1.5">
        {files.map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <FileCode size={12} className="shrink-0 mt-0.5 text-neutral-500" />
            <div>
              <code className="text-xs text-neutral-300 font-mono">{f.path}</code>
              <p className="text-[11px] text-neutral-500">{f.purpose}</p>
            </div>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}

interface EndpointRowProps {
  route: string;
  method: string;
  summary: string;
  auth: string;
}

function EndpointRow({ route, method, summary, auth }: EndpointRowProps) {
  const methodColors: Record<string, string> = {
    GET: 'text-emerald-400 bg-emerald-500/10',
    POST: 'text-blue-400 bg-blue-500/10',
    PUT: 'text-amber-400 bg-amber-500/10',
    PATCH: 'text-orange-400 bg-orange-500/10',
    DELETE: 'text-red-400 bg-red-500/10',
  };
  const color = methodColors[method] || 'text-neutral-400 bg-white/[0.04]';
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-2.5">
      <span className={`shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${color}`}>
        {method}
      </span>
      <div className="flex-1 min-w-0">
        <code className="text-xs text-neutral-300 font-mono">{route}</code>
        <p className="text-[11px] text-neutral-500 mt-0.5">{summary}</p>
      </div>
      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
        auth === 'Required' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
      }`}>
        {auth}
      </span>
    </div>
  );
}

interface DocContentSectionProps {
  section: any;
  sectionId: string;
  isBeginner: boolean;
}

export function DocContentSection({ section, sectionId, isBeginner }: DocContentSectionProps) {
  if (!section) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-12 text-center">
        <Info size={20} className="mx-auto text-neutral-600 mb-3" />
        <p className="text-sm text-neutral-400">No documentation available for this section.</p>
        <p className="text-xs text-neutral-500 mt-1">Select a repository and generate docs to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="rounded-2xl border border-white/[0.06] bg-[#090b10] p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white">{section.title}</h2>
            {section.summary && (
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{section.summary}</p>
            )}
          </div>
        </div>

        <div
          className="mt-4 text-sm text-neutral-400 leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(section.summary || '') }}
        />
      </motion.div>

      {sectionId === 'architecture' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Language', value: section.language || 'Unknown' },
              { label: 'Files', value: String(section.fileCount || 0) },
              { label: 'Branches', value: String(section.branchCount || 0) },
              { label: 'Tech Stack', value: section.techStack || 'Unknown' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-semibold text-white mt-1 truncate">{stat.value}</p>
              </div>
            ))}
          </div>

          {section.frameworks && section.frameworks.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <p className="text-xs text-neutral-400 mb-2">Detected Frameworks</p>
              <div className="flex flex-wrap gap-1.5">
                {section.frameworks.map((fw: string, i: number) => (
                  <span key={i} className="text-[11px] bg-white/[0.04] text-neutral-300 px-2 py-0.5 rounded">{fw}</span>
                ))}
              </div>
            </div>
          )}

          {section.directories && section.directories.length > 0 && (
            <Collapsible title={`Directory Structure (${section.directories.length} dirs)`}>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {section.directories.map((dir: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                    <span className="text-neutral-600">/</span>
                    {dir}
                  </div>
                ))}
              </div>
            </Collapsible>
          )}

          <FileList files={section.keyFiles} title={`Key Files (${section.keyFiles?.length || 0})`} />
        </motion.div>
      )}

      {sectionId === 'apis' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {section.routes && section.routes.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Route size={13} className="text-emerald-400" />
                <span>{section.totalEndpoints || section.routes.length} endpoint{section.routes.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1.5">
                {section.routes.map((r: any, i: number) => (
                  <EndpointRow key={i} {...r} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
              <p className="text-xs text-neutral-500">No API endpoints detected in this repository.</p>
            </div>
          )}
        </motion.div>
      )}

      {sectionId === 'auth' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {section.flows && section.flows.length > 0 ? (
            <div className="space-y-2">
              {section.flows.map((flow: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                  <Shield size={14} className={`shrink-0 mt-0.5 ${
                    flow.status === 'Secure' ? 'text-emerald-400' :
                    flow.status === 'Warning' ? 'text-amber-400' : 'text-red-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{flow.label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{flow.detail}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    flow.status === 'Secure' ? 'bg-emerald-500/10 text-emerald-400' :
                    flow.status === 'Warning' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {flow.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
              <p className="text-xs text-neutral-500">No authentication flows detected.</p>
            </div>
          )}

          {section.securityFindings && section.securityFindings.length > 0 && (
            <Collapsible title={`Security Findings (${section.securityFindings.length})`}>
              <div className="space-y-2">
                {section.securityFindings.map((f: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertTriangle size={11} className="shrink-0 mt-0.5 text-amber-400" />
                    <span className="text-neutral-400">{typeof f === 'string' ? f : f.title || f.message || JSON.stringify(f)}</span>
                  </div>
                ))}
              </div>
            </Collapsible>
          )}
        </motion.div>
      )}

      {sectionId === 'database' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {section.dbFiles && section.dbFiles.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Database size={13} className="text-emerald-400" />
                <span>{section.totalDbFiles || section.dbFiles.length} database file{section.dbFiles.length !== 1 ? 's' : ''}</span>
              </div>
              <FileList files={section.dbFiles} title="Database Files" />
              {section.dbDependencies && section.dbDependencies.length > 0 && (
                <Collapsible title={`Database Dependencies (${section.dbDependencies.length})`}>
                  <div className="space-y-1.5">
                    {section.dbDependencies.map((d: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-300 font-mono">{d.name}</span>
                        <span className="text-neutral-500">{d.version || 'latest'}</span>
                      </div>
                    ))}
                  </div>
                </Collapsible>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
              <p className="text-xs text-neutral-500">{isBeginner ? 'No database setup detected for this project.' : section.summary}</p>
            </div>
          )}
        </motion.div>
      )}

      {sectionId === 'components' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 gap-2">
            {section.components && section.components.map((comp: any, i: number) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                <div className="flex items-center gap-2">
                  <Puzzle size={13} className="text-emerald-400 shrink-0" />
                  <code className="text-xs text-neutral-200 font-mono">{comp.path}</code>
                </div>
                <p className="text-xs text-neutral-400 mt-1.5">{comp.purpose}</p>
                {comp.analysis && (
                  <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{comp.analysis}</p>
                )}
              </div>
            ))}
          </div>

          {section.modules && section.modules.length > 0 && (
            <Collapsible title={`Core Modules (${section.modules.length})`}>
              <div className="space-y-2">
                {section.modules.map((mod: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <FileCode size={11} className="shrink-0 mt-0.5 text-neutral-500" />
                    <div>
                      <code className="text-neutral-300 font-mono">{mod.path}</code>
                      <p className="text-neutral-500">{mod.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Collapsible>
          )}
        </motion.div>
      )}

      {sectionId === 'environment' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <p className="text-xs text-neutral-400 mb-2">Environment Files</p>
              <p className="text-lg font-semibold text-white">{section.totalEnv || 0}</p>
              {section.envFiles && section.envFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {section.envFiles.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <FileCode size={11} className="text-neutral-500 shrink-0" />
                      <code className="text-neutral-400 truncate">{f.path}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
              <p className="text-xs text-neutral-400 mb-2">Config Files</p>
              <p className="text-lg font-semibold text-white">{section.totalConfig || 0}</p>
              {section.configFiles && section.configFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {section.configFiles.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <FileCode size={11} className="text-neutral-500 shrink-0" />
                      <code className="text-neutral-400 truncate">{f.path}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {sectionId === 'deployment' && (
        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {section.deployFiles && section.deployFiles.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Rocket size={13} className="text-emerald-400" />
                <span>{section.totalDeploy || section.deployFiles.length} deployment file{section.deployFiles.length !== 1 ? 's' : ''}</span>
              </div>
              <FileList files={section.deployFiles} title="Deployment Files" />
            </>
          ) : (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-center">
              <Rocket size={20} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-500">
                {isBeginner
                  ? 'This project does not include deployment configuration.'
                  : section.summary}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {isBeginner && (
        <motion.div
          className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-2">
            <Sparkles size={13} className="shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="text-xs font-medium text-emerald-400 mb-1">What does this mean?</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                This section explains how your project handles {sectionId === 'architecture' ? 'its overall structure and technology choices' : sectionId === 'apis' ? 'communication between different parts of the application' : sectionId === 'auth' ? 'user identity and access control' : sectionId === 'database' ? 'data storage and organization' : sectionId === 'components' ? 'the building blocks that make up the user interface' : sectionId === 'environment' ? 'configuration and settings that control how the app runs' : 'how the application is built, tested, and published'}.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


