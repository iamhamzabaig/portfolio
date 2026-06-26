import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from '../../src/features/projects/components/Lightbox.jsx';

const images = ['https://cdn/a.png', 'https://cdn/b.png', 'https://cdn/c.png'];

describe('Lightbox', () => {
  it('shows the current image with a counter', () => {
    render(<Lightbox images={images} index={0} onClose={vi.fn()} onIndex={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: /screenshot viewer/i })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('calls onIndex when clicking next', async () => {
    const user = userEvent.setup();
    const onIndex = vi.fn();
    render(<Lightbox images={images} index={0} onClose={vi.fn()} onIndex={onIndex} />);
    await user.click(screen.getByRole('button', { name: /next screenshot/i }));
    expect(onIndex).toHaveBeenCalledWith(1);
  });

  it('calls onClose on the Close button and on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox images={images} index={1} onClose={onClose} onIndex={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
