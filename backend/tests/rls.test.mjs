import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'rls-test-admin@example.com';
const ADMIN_PASSWORD = 'test-password-123456';
const clientOpts = { auth: { persistSession: false, autoRefreshToken: false } };

let anon;        // unauthenticated (anon key)
let service;     // service-role key (bypasses RLS) — used only to create the admin
let adminAuthed; // signed-in admin session (anon key + JWT)

before(async () => {
  // Ensure the local stack is up and the schema + seed are applied fresh.
  execSync('supabase start', { stdio: 'inherit' });
  execSync('supabase db reset', { stdio: 'inherit' });

  const status = JSON.parse(execSync('supabase status -o json').toString());
  const url = status.API_URL;

  anon = createClient(url, status.ANON_KEY, clientOpts);
  service = createClient(url, status.SERVICE_ROLE_KEY, clientOpts);

  // Signups are disabled, so create the admin via the Auth admin API.
  const { error: createErr } = await service.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });
  assert.equal(createErr, null, 'admin user creation should succeed');

  adminAuthed = createClient(url, status.ANON_KEY, clientOpts);
  const { error: signInErr } = await adminAuthed.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  assert.equal(signInErr, null, 'admin sign-in should succeed');
}, { timeout: 180000 });

// ---------- anon: projects ----------
test('anon can read seeded projects', async () => {
  const { data, error } = await anon.from('projects').select('id');
  assert.equal(error, null);
  assert.ok(data.length >= 2, 'expected seeded projects to be readable');
});

test('anon insert into projects is rejected', async () => {
  const { error } = await anon
    .from('projects')
    .insert({ title: 'Hack', description: 'x' });
  assert.notEqual(error, null, 'RLS should block anon insert');
});

test('anon update on projects is rejected (no privilege)', async () => {
  const { data: rows } = await anon.from('projects').select('id').limit(1);
  const { error } = await anon
    .from('projects')
    .update({ title: 'Hacked' })
    .eq('id', rows[0].id);
  assert.notEqual(error, null, 'anon lacks UPDATE grant -> permission denied');
});

test('anon delete on projects is rejected (no privilege)', async () => {
  const { data: rows } = await anon.from('projects').select('id').limit(1);
  const { error } = await anon.from('projects').delete().eq('id', rows[0].id);
  assert.notEqual(error, null, 'anon lacks DELETE grant -> permission denied');
});

// ---------- anon: contact_messages ----------
test('anon can insert a contact message', async () => {
  const { error } = await anon
    .from('contact_messages')
    .insert({ name: 'Visitor', email: 'v@example.com', message: 'Hello' });
  assert.equal(error, null, 'anon should be able to submit a contact message');
});

test('anon cannot read contact messages (no privilege)', async () => {
  const { error } = await anon.from('contact_messages').select('*');
  assert.notEqual(error, null, 'anon lacks SELECT grant on contact_messages');
});

// ---------- anon: profile ----------
test('anon can read the profile row', async () => {
  const { data, error } = await anon.from('profile').select('*');
  assert.equal(error, null);
  assert.equal(data.length, 1);
});

test('anon update on profile is rejected (no privilege)', async () => {
  const { error } = await anon
    .from('profile')
    .update({ headline: 'Hacked' })
    .eq('id', 1);
  assert.notEqual(error, null, 'anon lacks UPDATE grant on profile');
});

// ---------- authenticated admin ----------
test('admin can insert a project and slug auto-generates', async () => {
  const { data, error } = await adminAuthed
    .from('projects')
    .insert({ title: 'My New Project', description: 'd' })
    .select();
  assert.equal(error, null);
  assert.equal(data[0].slug, 'my-new-project');
});

test('admin updated_at trigger touches the row on update', async () => {
  const { data: created } = await adminAuthed
    .from('projects')
    .insert({ title: 'Touch Test', description: 'd' })
    .select();
  const beforeTs = created[0].updated_at;
  await new Promise((r) => setTimeout(r, 1100));
  const { data: updated, error } = await adminAuthed
    .from('projects')
    .update({ description: 'd2' })
    .eq('id', created[0].id)
    .select();
  assert.equal(error, null);
  assert.notEqual(updated[0].updated_at, beforeTs, 'updated_at should change');
});

test('admin can read contact messages', async () => {
  await anon
    .from('contact_messages')
    .insert({ name: 'V2', email: 'v2@example.com', message: 'Hi again' });
  const { data, error } = await adminAuthed.from('contact_messages').select('*');
  assert.equal(error, null);
  assert.ok(data.length >= 1, 'admin should read contact messages');
});

test('admin can update the profile', async () => {
  const { data, error } = await adminAuthed
    .from('profile')
    .update({ headline: 'Updated headline' })
    .eq('id', 1)
    .select();
  assert.equal(error, null);
  assert.equal(data[0].headline, 'Updated headline');
});
