import { supabase } from '../../../lib/supabaseClient.js';

const toMessage = (row) => ({
  _id: row.id,
  name: row.name,
  email: row.email,
  message: row.message,
  isRead: row.is_read,
  createdAt: row.created_at
});

export async function submitContact(payload) {
  // Anon can INSERT but RLS forbids SELECT here — do NOT chain .select().
  const { error } = await supabase.from('contact_messages').insert({
    name: payload.name,
    email: payload.email,
    message: payload.message
  });
  if (error) throw error;
  return { ok: true };
}

export async function fetchMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toMessage);
}

export async function deleteMessage(id) {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
  return { _id: id };
}
