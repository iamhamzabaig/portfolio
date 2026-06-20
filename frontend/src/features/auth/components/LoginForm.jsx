import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';

const schema = z.object({
  email: z.string().email('Use a valid email'),
  password: z.string().min(1, 'Password is required')
});

export function LoginForm({ onSubmit, isPending = false, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {error ? <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">Unable to sign in.</p> : null}
      <Button type="submit" disabled={isPending}>
        <LogIn aria-hidden="true" size={17} />
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
