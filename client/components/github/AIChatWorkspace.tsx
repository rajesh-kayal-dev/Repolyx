import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Loader2, Bot, User, Check, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api-client';

interface AIChatWorkspaceProps {
  username: string;
  avatar: string;
  onDisconnect: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  state?: any; // To handle pending destructive actions
}

export function AIChatWorkspace({ username, avatar, onDisconnect }: AIChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: `Hello @${username}! I am your AI GitHub Workspace assistant. I can help you manage your repositories, branches, create files, and more. What would you like to do today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingState, setPendingState] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isSending) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      // Build history for context if needed (last 10 messages)
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      
      const result = await api.githubWorkspace.chat(text.trim(), history, { pendingAction: pendingState });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: result.response,
        state: result.state
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setPendingState(result.state || null);
      
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `**Error:** ${error.message || 'Failed to communicate with AI'}`
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-5xl mx-auto bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#111]">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt={username} className="w-10 h-10 rounded-full border border-neutral-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#111] rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-200">AI Workspace</h3>
            <p className="text-xs text-neutral-500">Connected as @{username}</p>
          </div>
        </div>
        
        <button 
          onClick={onDisconnect}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user'
                  ? 'bg-emerald-500/10 text-emerald-100 border border-emerald-500/20'
                  : 'bg-[#1a1a1a] text-neutral-200 border border-neutral-800'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Interactive State Actions (e.g. Confirm / Cancel) */}
                {msg.state && msg.state.toolName && (
                  <div className="mt-4 pt-4 border-t border-red-500/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium text-red-300">Action requires confirmation</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSend('Confirm')}
                        disabled={isSending}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleSend('Cancel')}
                        disabled={isSending}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isSending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl px-5 py-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm text-neutral-400">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#111] border-t border-neutral-800">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingState ? 'Type "Confirm" or "Cancel"...' : 'Ask AI to manage your repositories...'}
            className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 min-h-[52px] max-h-32 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            rows={1}
            disabled={isSending}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white h-[52px] px-4 rounded-xl transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
