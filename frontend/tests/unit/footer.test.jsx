import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../../src/components/layout/Footer.jsx';

describe('Footer', () => {
  it('has a discreet admin link to the login page', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /admin/i })).toHaveAttribute('href', '/admin/login');
  });
});
