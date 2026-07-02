import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ContactForm } from '../../src/features/contact/components/ContactForm.jsx';

vi.mock('../../src/features/contact/api/contact.api.js', () => ({
  submitContact: vi.fn().mockResolvedValue({})
}));

describe('ContactForm', () => {
  it('submits valid contact details', async () => {
    const { user } = renderWithProviders(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'Jane Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Message'), 'This is a project message.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(screen.getByText(/message sent/i)).toBeInTheDocument());
  });
});
