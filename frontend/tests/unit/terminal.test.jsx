import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Terminal } from '../../src/components/ide/Terminal.jsx';

const profile = { name: 'Hamza', role: 'Engineer', headline: 'Builds things.' };
const projects = [{ slug: 'drop-in', title: 'Drop In' }];

function setup() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Terminal profile={profile} projects={projects} animate={false} />} />
        <Route path="/about" element={<p>about page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Terminal', () => {
  it('renders the intro at once when not animating', () => {
    setup();
    const log = screen.getByRole('log');
    expect(log).toHaveTextContent('Builds things.');
    expect(log).toHaveTextContent('drop-in');
  });

  it('runs a typed command', () => {
    setup();
    const input = screen.getByLabelText('Terminal command');
    fireEvent.change(input, { target: { value: 'nope' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByRole('log')).toHaveTextContent('command not found: nope');
  });

  it('navigates on open', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'about' }));
    expect(await screen.findByText('about page')).toBeInTheDocument();
  });
});
