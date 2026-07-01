import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { PageTransition } from '../../src/components/layout/PageTransition.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('PageTransition', () => {
  it('renders its children', () => {
    renderWithProviders(
      <PageTransition>
        <h1>Routed content</h1>
      </PageTransition>
    );
    expect(screen.getByText('Routed content')).toBeInTheDocument();
  });
});
