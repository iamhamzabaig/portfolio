import { zodResolver } from '@hookform/resolvers/zod';
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
    reset();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="name" label="Name" error={errors.name?.message} {...register('name')} />
        <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
      </div>
      <Textarea id="message" label="Message" error={errors.message?.message} {...register('message')} />
      {mutation.isSuccess ? <p className="rounded-2xl bg-success/10 px-4 py-2.5 text-[14px] font-medium text-success">Message sent.</p> : null}
      {mutation.isError ? <p className="rounded-2xl bg-danger/10 px-4 py-2.5 text-[14px] font-medium text-danger">Message could not be sent yet.</p> : null}
      <Button type="submit" disabled={mutation.isPending}>
        <Send aria-hidden="true" size={17} />
        {mutation.isPending ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
}
