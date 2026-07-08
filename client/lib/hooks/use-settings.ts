import useSWR from 'swr';
import { api } from '@/lib/api-client';
import { showToast } from '@/lib/use-toast';
import {
  ProfileData,
  GithubIntegrationData,
  AppearanceData,
  NotificationPreferences,
  AIPreferencesData,
  UserSessionData,
  AccessTokenData,
} from '@/lib/types/settings';

// --- Profile ---
export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: ProfileData }>('/api/settings/profile', api.settings.profile.get);

  const updateProfile = async (updates: { displayName: string; workspaceName: string }) => {
    try {
      await api.settings.profile.update(updates);
      await mutate();
      showToast('Profile updated successfully', 'success');
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error');
      return false;
    }
  };

  return { profile: data?.data, isLoading, isError: error, updateProfile };
}

// --- GitHub Integration ---
export function useGithubIntegration() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: GithubIntegrationData }>('/api/settings/github', api.settings.github.get);

  const disconnect = async () => {
    try {
      await api.settings.github.disconnect();
      await mutate();
      showToast('GitHub disconnected successfully', 'success');
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to disconnect GitHub', 'error');
      return false;
    }
  };

  return { github: data?.data, isLoading, isError: error, disconnect };
}

// --- Appearance ---
export function useAppearance() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: AppearanceData }>('/api/settings/appearance', api.settings.appearance.get);

  const updateAppearance = async (updates: AppearanceData) => {
    try {
      // Optimistic update
      mutate({ success: true, data: updates }, false);
      await api.settings.appearance.update(updates);
      await mutate(); // Revalidate
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to update appearance', 'error');
      await mutate(); // Rollback on failure
      return false;
    }
  };

  return { appearance: data?.data, isLoading, isError: error, updateAppearance };
}

// --- Notifications ---
export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: NotificationPreferences }>('/api/settings/notifications', api.settings.notifications.get);

  const updateNotifications = async (updates: NotificationPreferences) => {
    try {
      mutate({ success: true, data: updates }, false);
      await api.settings.notifications.update(updates);
      await mutate();
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to update notifications', 'error');
      await mutate();
      return false;
    }
  };

  return { notifications: data?.data, isLoading, isError: error, updateNotifications };
}

// --- AI Preferences ---
export function useAIPreferences() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: AIPreferencesData }>('/api/settings/ai-preferences', api.settings.ai.get);

  const updateAIPreferences = async (updates: AIPreferencesData) => {
    try {
      mutate({ success: true, data: updates }, false);
      await api.settings.ai.update(updates);
      await mutate();
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to update AI preferences', 'error');
      await mutate();
      return false;
    }
  };

  return { aiPreferences: data?.data, isLoading, isError: error, updateAIPreferences };
}

// --- Security ---
export function useSecurity() {
  const { data: sessionsData, error: sessionsError, isLoading: sessionsLoading, mutate: mutateSessions } = useSWR<{ success: boolean; sessions: UserSessionData[] }>('/api/settings/security', api.settings.security.sessions);
  const { data: tokensData, error: tokensError, isLoading: tokensLoading, mutate: mutateTokens } = useSWR<{ success: boolean; data: AccessTokenData[] }>('/api/settings/access-tokens', api.settings.security.tokens);

  const deleteSession = async (id: string) => {
    try {
      await api.settings.security.deleteSession(id);
      await mutateSessions();
      showToast('Session terminated', 'success');
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to terminate session', 'error');
      return false;
    }
  };

  const deleteAllOtherSessions = async () => {
    try {
      await api.settings.security.deleteAllOtherSessions();
      await mutateSessions();
      showToast('All other sessions terminated', 'success');
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to terminate sessions', 'error');
      return false;
    }
  };

  const createToken = async (name: string, expiresInDays?: number) => {
    try {
      const res = await api.settings.security.createToken({ name, expiresInDays });
      await mutateTokens();
      showToast('Access token created', 'success');
      return res.data.token; // return raw token string
    } catch (e: any) {
      showToast(e.message || 'Failed to create token', 'error');
      return null;
    }
  };

  const revokeToken = async (id: string) => {
    try {
      await api.settings.security.revokeToken(id);
      await mutateTokens();
      showToast('Access token revoked', 'success');
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to revoke token', 'error');
      return false;
    }
  };

  const deleteToken = async (id: string) => {
    try {
      await api.settings.security.deleteToken(id);
      await mutateTokens();
      showToast('Access token deleted', 'success');
      return true;
    } catch (e: any) {
      showToast(e.message || 'Failed to delete token', 'error');
      return false;
    }
  };

  return {
    sessions: sessionsData?.sessions,
    tokens: tokensData?.data,
    isLoading: sessionsLoading || tokensLoading,
    isError: sessionsError || tokensError,
    deleteSession,
    deleteAllOtherSessions,
    createToken,
    revokeToken,
    deleteToken,
  };
}
