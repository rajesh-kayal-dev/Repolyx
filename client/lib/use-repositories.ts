import useSWR from 'swr';
import { api } from '@/lib/api-client';
import { RepoHealthSummary } from '@/lib/types';

export function useRepositories() {
  const { data, error, isLoading, mutate } = useSWR<{ repositories: RepoHealthSummary[] }>(
    '/api/debug/repositories',
    api.debug.repositories.list,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Poll every 30s to keep UI fresh
    }
  );

  return {
    repositories: data?.repositories || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
