import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from 'react-router-dom';
import { Button } from '../../src/components/ui/Button.jsx';
import { Card } from '../../src/components/ui/Card.jsx';
import { Chip } from '../../src/components/ui/Chip.jsx';
import { Input } from '../../src/components/ui/Input.jsx';
import { Spinner } from '../../src/components/ui/Spinner.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('UI primitives', () => {
  it('renders a button', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('Button renders as a link when as={Link}', () => {
    renderWithProviders(<Button as={Link} to="/projects">Go</Button>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('href', '/projects');
  });

  it('Button submit type works', () => {
    renderWithProviders(<Button type="submit">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('renders input label and error', () => {
    render(<Input id="email" label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    // HeroUI renders the error in a data-slot="error-message" node (no role="alert");
    // it is associated to the input via aria-describedby. Assert the text is shown.
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders a spinner status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a chip', () => {
    render(<Chip>React</Chip>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('Card renders children', () => {
    renderWithProviders(<Card><span>inside</span></Card>);
    expect(screen.getByText('inside')).toBeInTheDocument();
  });

  it('Spinner exposes a status role with label', () => {
    renderWithProviders(<Spinner label="Loading projects" />);
    expect(screen.getByRole('status', { name: 'Loading projects' })).toBeInTheDocument();
  });
});
