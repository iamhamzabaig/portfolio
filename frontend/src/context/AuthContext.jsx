import { createContext, useContext, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, loginRequest, logoutRequest } from '../features/auth/api/auth.api.js';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => queryClient.setQueryData(['me'], user)
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => queryClient.setQueryData(['me'], null)
  });

  // Keep ['me'] in sync with Supabase auth (initial session, refresh, sign-out,
  // changes in another tab).
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['me'], session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user: meQuery.data || null,
      isLoading: meQuery.isLoading,
      isAuthenticated: Boolean(meQuery.data),
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      loginError: loginMutation.error,
      isLoggingIn: loginMutation.isPending
    }),
    [meQuery.data, meQuery.isLoading, loginMutation.mutateAsync, loginMutation.error, loginMutation.isPending, logoutMutation.mutateAsync]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
