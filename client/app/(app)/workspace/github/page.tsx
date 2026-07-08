"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { ConnectWorkspace } from '@/components/github/ConnectWorkspace';
import { AIChatWorkspace } from '@/components/github/AIChatWorkspace';
import { showToast } from '@/lib/use-toast';
import { Loader2 } from 'lucide-react';

export default function GitHubWorkspacePage() {
  const [isChecking, setIsChecking] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username: string; avatar: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      const res = await api.githubWorkspace.status();
      setIsConnected(res.connected);
      if (res.connected && res.username) {
        setUserProfile({ username: res.username, avatar: res.avatar || '' });
      }
    } catch (error) {
      console.error('Failed to get status', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async (token: string) => {
    try {
      setIsConnecting(true);
      const res = await api.githubWorkspace.connect(token);
      setIsConnected(true);
      setUserProfile({ username: res.username, avatar: res.avatar });
      showToast('GitHub Account Connected successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to connect to GitHub', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.githubWorkspace.disconnect();
      setIsConnected(false);
      setUserProfile(null);
      showToast('Disconnected successfully', 'success');
    } catch (error: any) {
      showToast('Failed to disconnect', 'error');
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[600px] w-full">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-20 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI GitHub Workspace</h1>
        <p className="text-neutral-400">Manage your repositories using natural language.</p>
      </div>

      {isConnected && userProfile ? (
        <AIChatWorkspace 
          username={userProfile.username} 
          avatar={userProfile.avatar} 
          onDisconnect={handleDisconnect} 
        />
      ) : (
        <ConnectWorkspace 
          onConnect={handleConnect} 
          isLoading={isConnecting} 
        />
      )}
    </div>
  );
}
