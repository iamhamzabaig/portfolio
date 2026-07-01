import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { HeroUIProvider } from '@heroui/react';
import { MemoryRouter } from 'react-router-dom';
import { createQueryClient } from '../app/queryClient.js';

export function renderWithProviders(ui, { route = '/' } = {}) {
  const queryClient = createQueryClient();
  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <HeroUIProvider>{ui}</HeroUIProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { ...result, user, queryClient };
}
