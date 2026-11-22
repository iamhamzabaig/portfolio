import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';

export default function NotFound() {
  return (
    <Container className="py-32 font-mono">
      <p className="text-body-sm text-muted">
        <span className="syn-keyword">$</span> cd {typeof window !== 'undefined' ? window.location.pathname : ''}
      </p>
      <h1 className="mt-3 text-fluid-h1 font-semibold syn-error">bash: page not found</h1>
      <p className="mt-4 max-w-md text-body-lg text-muted">The page does not exist or has moved. Exit code 404.</p>
      <Link to="/" className="btn btn-primary btn-plain mt-9">cd ~</Link>
    </Container>
  );
}
