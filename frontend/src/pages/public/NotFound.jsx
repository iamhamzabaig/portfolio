import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-body-lg text-muted">The page does not exist or has moved.</p>
      <Button as={Link} to="/" className="mt-9">Back home</Button>
    </Container>
  );
}
