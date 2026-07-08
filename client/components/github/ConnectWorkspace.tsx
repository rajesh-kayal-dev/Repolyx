import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ConnectWorkspaceProps {
  onConnect: (token: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function ConnectWorkspace({ onConnect, isLoading, error }: ConnectWorkspaceProps) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onConnect(token.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] w-full max-w-2xl mx-auto p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-[#111] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 bg-[#1a1a1a] border border-neutral-800 rounded-2xl flex items-center justify-center mb-6 relative">
            <Github className="w-8 h-8 text-neutral-300" />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">GitHub AI Workspace</h2>
          <p className="text-neutral-400 max-w-sm">
            Connect your GitHub account using a Personal Access Token (PAT) to allow AI to manage your repositories effortlessly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 ml-1">
              Personal Access Token
            </label>
            <div className="relative">
              <input 
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={!token.trim() || isLoading}
            className="w-full bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Connect Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <p className="text-sm text-neutral-500">
            Need help? {' '}
            <a 
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens" 
              target="_blank" 
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
            >
              Learn how to generate a PAT
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
