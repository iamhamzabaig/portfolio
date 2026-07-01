import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

const FULL_BODY =
  'This is the full contact message body that should only appear inside the detail sheet once opened.';

vi.mock('../../src/features/contact/api/contact.api.js', () => ({
  fetchMessages: vi.fn().mockResolvedValue([
    { _id: 'm1', name: 'Jane Doe', email: 'jane@example.com', message: FULL_BODY, isRead: false, createdAt: '2026-01-01' }
  ]),
  deleteMessage: vi.fn().mockResolvedValue({ _id: 'm1' }),
  submitContact: vi.fn()
}));

const Messages = (await import('../../src/pages/admin/Messages.jsx')).default;

describe('Admin Messages detail sheet', () => {
  it('opens the full message body in a sheet when a row is opened', async () => {
    const { user } = renderWithProviders(<Messages />, { route: '/admin/messages' });
    await screen.findByRole('button', { name: /open message from jane/i });
    await user.click(screen.getByRole('button', { name: /open message from jane/i }));
    expect(await screen.findByText(FULL_BODY)).toBeInTheDocument();
  });
});
