import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm tracking-eyebrow text-primary">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">That route does not exist. Let’s get you back.</p>
      <Button as={Link} to="/" className="mt-8">Back home</Button>
    </Container>
  );
}
