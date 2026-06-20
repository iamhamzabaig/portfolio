import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../../src/components/ui/Button.jsx';
import { Chip } from '../../src/components/ui/Chip.jsx';
import { Input } from '../../src/components/ui/Input.jsx';
import { Spinner } from '../../src/components/ui/Spinner.jsx';

describe('UI primitives', () => {
  it('renders a button', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('renders input label and error', () => {
    render(<Input id="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('renders a spinner status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a chip', () => {
    render(<Chip>React</Chip>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});
