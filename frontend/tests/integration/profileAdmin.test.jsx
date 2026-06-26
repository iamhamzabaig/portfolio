import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProfileAdmin from '../../src/pages/admin/ProfileAdmin.jsx';
import { updateProfile } from '../../src/features/profile/api/profile.api.js';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'Hamza', resumeUrl: '' }),
  updateProfile: vi.fn().mockResolvedValue({})
}));

describe('ProfileAdmin', () => {
  it('saves the resume URL', async () => {
    const { user } = renderWithProviders(<ProfileAdmin />);
    await waitFor(() => expect(screen.getByLabelText('Resume URL')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Resume URL'), 'https://cdn/resume.pdf');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    expect(updateProfile.mock.calls[0][0]).toMatchObject({ resumeUrl: 'https://cdn/resume.pdf' });
  });
});
