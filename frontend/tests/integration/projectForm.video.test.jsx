import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

function fileOfSize(name, type, bytes) {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: bytes });
  return f;
}

describe('ProjectForm — demo video', () => {
  it('renders a demo video input', () => {
    renderWithProviders(<ProjectForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/demo video/i)).toBeInTheDocument();
  });

  it('rejects a video larger than 50 MB without calling onSubmit', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'My Project');
    await user.type(screen.getByLabelText('Description'), 'A long enough description.');
    await user.upload(screen.getByLabelText(/demo video/i), fileOfSize('big.mp4', 'video/mp4', 60 * 1024 * 1024));
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/50 MB/i));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
