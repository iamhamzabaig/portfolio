import { zodResolver } from '@hookform/resolvers/zod';
import { addToast } from '@heroui/react';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { useSubmitContact } from '../api/contact.queries.js';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Use a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export function ContactForm() {
  const mutation = useSubmitContact();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' }
  });

  const onSubmit = async (values) => {
    await mutation.mutateAsync(values);
    addToast({ title: 'Message sent', description: 'Thanks — I will reply soon.', color: 'success' });
    reset();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="name" label="Name" error={errors.name?.message} {...register('name')} />
        <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
      </div>
      <Textarea id="message" label="Message" error={errors.message?.message} {...register('message')} />
      {mutation.isSuccess ? <p className="rounded-md border border-teal/40 bg-teal/10 px-3 py-2 text-sm text-teal">Message sent.</p> : null}
      {mutation.isError ? <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">Message could not be sent yet.</p> : null}
      <Button type="submit" disabled={mutation.isPending}>
        <Send aria-hidden="true" size={17} />
        {mutation.isPending ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
}
