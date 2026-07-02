import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { LoginForm } from '../../features/auth/components/LoginForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = async (values) => {
    await login(values);
    navigate('/admin');
  };

  return (
    <Container className="grid min-h-screen place-items-center py-10">
      <Card className="w-full max-w-md p-6">
        <p className="font-mono text-xs uppercase text-accent">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">Use the seeded admin account from the backend.</p>
        <div className="mt-6">
          <LoginForm onSubmit={handleSubmit} isPending={isLoggingIn} error={loginError} />
        </div>
      </Card>
    </Container>
  );
}
