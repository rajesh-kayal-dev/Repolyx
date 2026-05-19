'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const settingsSections = [
  {
    title: 'Workspace',
    items: [
      { label: 'Profile & settings', description: 'Workspace identity, timezone, defaults' },
      { label: 'GitHub integration', description: 'OAuth, webhooks, repository sync' },
      { label: 'AI providers', description: 'OpenAI, Claude, Gemini routing' },
    ],
  },
  {
    title: 'Security & Access',
    items: [
      { label: 'Repository access', description: 'Team permissions, AI visibility' },
      { label: 'API keys', description: 'Generate and manage secret keys' },
      { label: 'Two-factor auth', description: 'Enable 2FA and session management' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Notifications', description: 'Alerts and notification rules' },
      { label: 'Appearance', description: 'Theme, density, animations' },
      { label: 'Experimental', description: 'Beta features and labs' },
    ],
  },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="max-w-lg">
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="group w-full flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
                  </div>
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-500 transition-colors group-hover:bg-white/[0.06] group-hover:text-neutral-300">
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-neutral-500">
            For full workspace configuration, visit the{' '}
            <a href="/settings" className="text-cyan-400 hover:text-cyan-300">
              settings page
            </a>
            .
          </p>
        </div>
      </div>
    </Modal>
  );
}
