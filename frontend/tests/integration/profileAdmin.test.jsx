import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProfileAdmin from '../../src/pages/admin/ProfileAdmin.jsx';
import { updateProfile } from '../../src/features/profile/api/profile.api.js';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'Hamza', resumeUrl: '', resumePath: '' }),
  updateProfile: vi.fn().mockResolvedValue({})
}));

describe('ProfileAdmin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads a resume PDF and passes the file + current path', async () => {
    const { user } = renderWithProviders(<ProfileAdmin />);
    await waitFor(() => expect(screen.getByLabelText(/resume \(pdf\)/i)).toBeInTheDocument());

    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText(/resume \(pdf\)/i), file);
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    const payload = updateProfile.mock.calls[0][0];
    expect(payload.resumeFile).toBeTruthy();
    expect(payload).toHaveProperty('currentResumePath');
  });

  it('rejects a PDF larger than 10 MB without calling updateProfile', async () => {
    const { user } = renderWithProviders(<ProfileAdmin />);
    await waitFor(() => expect(screen.getByLabelText(/resume \(pdf\)/i)).toBeInTheDocument());

    const big = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    Object.defineProperty(big, 'size', { value: 11 * 1024 * 1024 });
    await user.upload(screen.getByLabelText(/resume \(pdf\)/i), big);
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/10 MB/i));
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
