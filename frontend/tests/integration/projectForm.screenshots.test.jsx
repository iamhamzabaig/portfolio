import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

const withShots = {
  _id: '1', title: 'My Project', description: 'A long enough description.', tags: [],
  coverImage: { url: '' }, video: { url: '', path: '' },
  screenshots: [{ url: 'https://cdn/a.png', path: 'a.png' }, { url: 'https://cdn/b.png', path: 'b.png' }]
};

function imageFiles(n) {
  return Array.from({ length: n }, (_, i) => new File(['x'], `s${i}.png`, { type: 'image/png' }));
}

describe('ProjectForm — screenshots', () => {
  it('lists existing screenshots and emits removed paths on save', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm project={withShots} onSubmit={onSubmit} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove screenshot/i });
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[0]);
    expect(screen.getAllByRole('button', { name: /remove screenshot/i })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /save project/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ removeScreenshotPaths: ['a.png'] });
  });

  it('blocks save when more than 8 screenshots total', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'My Project');
    await user.type(screen.getByLabelText('Description'), 'A long enough description.');
    await user.upload(screen.getByLabelText(/screenshots/i), imageFiles(9));
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(screen.getByText(/max 8 screenshots/i)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
