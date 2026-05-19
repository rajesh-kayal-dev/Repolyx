'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Github, Lightbulb, MessageSquare, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpItems = [
  {
    icon: Lightbulb,
    title: 'Getting Started',
    description: 'Learn the basics of navigating Repolyx and running your first analysis.',
    href: '#',
  },
  {
    icon: Github,
    title: 'Connect GitHub',
    description: 'Link your repositories and enable AI-powered code review.',
    href: '#',
  },
  {
    icon: Zap,
    title: 'Analyze Repository',
    description: 'Scan your codebase for architecture, dependencies, and risks.',
    href: '#',
  },
  {
    icon: MessageSquare,
    title: 'AI Code Review',
    description: 'Get contextual AI suggestions on pull requests and code changes.',
    href: '#',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Browse full API reference and integration guides.',
    href: '#',
  },
  {
    icon: MessageSquare,
    title: 'Contact Support',
    description: 'Reach out to our team for help with setup or issues.',
    href: 'mailto:support@repolyx.dev',
  },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Support" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Quick action items */}
        {helpItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.title}
              href={item.href}
              className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-neutral-400">{item.description}</p>
              </div>
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors group-hover:bg-white/[0.06] group-hover:text-neutral-300">
                <ArrowRight size={16} />
              </div>
            </a>
          );
        })}

        {/* Footer */}
        <div className="mt-6 border-t border-white/5 pt-4">
          <p className="text-xs text-neutral-500">Repolyx v1.0.0</p>
          <p className="text-xs text-neutral-500">support@repolyx.dev</p>
        </div>
      </div>
    </Modal>
  );
}
