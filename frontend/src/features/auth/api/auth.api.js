import { supabase } from '../../../lib/supabaseClient.js';

export async function loginRequest({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logoutRequest() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function fetchMe() {
  // No session => treat as logged out rather than throwing.
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
