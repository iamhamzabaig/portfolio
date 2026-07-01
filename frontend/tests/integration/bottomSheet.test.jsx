import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { BottomSheet } from '../../src/components/layout/BottomSheet.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('BottomSheet', () => {
  it('renders children and title when open', () => {
    renderWithProviders(
      <BottomSheet isOpen onOpenChange={() => {}} title="Filters">
        <p>Sheet body</p>
      </BottomSheet>
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Sheet body')).toBeInTheDocument();
  });

  it('renders nothing visible when closed', () => {
    renderWithProviders(
      <BottomSheet isOpen={false} onOpenChange={() => {}} title="Filters">
        <p>Sheet body</p>
      </BottomSheet>
    );
    expect(screen.queryByText('Sheet body')).not.toBeInTheDocument();
  });
});
