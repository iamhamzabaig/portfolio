import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../../src/components/layout/ThemeToggle.jsx';
import { ThemeProvider } from '../../src/context/ThemeContext.jsx';

describe('theme', () => {
  // The no-flash inline script (index.html) sets the class before paint; the
  // provider reads it. Simulate that pre-existing dark state here.
  beforeEach(() => {
    document.documentElement.classList.add('dark');
  });
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('toggles the dark class', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    await user.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists the chosen theme to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
