import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { AdminLayout } from '../../src/layouts/AdminLayout.jsx';

const renderLayout = () =>
  renderWithProviders(
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<h1>Dashboard page</h1>} />
      </Route>
    </Routes>,
    { route: '/admin' }
  );

describe('AdminLayout shell', () => {
  it('renders the sidebar nav links', () => {
    renderLayout();
    ['Dashboard', 'Projects', 'Messages', 'Profile'].forEach((label) =>
      expect(screen.getAllByRole('link', { name: new RegExp(`^${label}$`, 'i') }).length).toBeGreaterThanOrEqual(1)
    );
  });

  it('opens a drawer of nav links from the menu button', async () => {
    const { user } = renderLayout();
    await user.click(screen.getByRole('button', { name: /open admin menu/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /projects/i })).toBeInTheDocument();
  });

  it('does not render a mobile bottom tab bar', () => {
    renderLayout();
    expect(screen.queryByRole('navigation', { name: /primary/i })).toBeNull();
  });
});
