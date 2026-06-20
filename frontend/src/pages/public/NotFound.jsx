import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-mono text-sm uppercase text-accent">404</p>
      <h1 className="mt-2 text-4xl font-semibold">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">The page does not exist or has moved.</p>
      <Button as={Link} to="/" className="mt-7">Back home</Button>
    </Container>
  );
}
