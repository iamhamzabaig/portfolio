import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { useToast } from '../../../components/ui/Toast.jsx';
import { useSubmitContact } from '../api/contact.queries.js';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Use a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export function ContactForm() {
  const mutation = useSubmitContact();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' }
  });

  const [sent, setSent] = useState(false);
  const fields = useRef(null);
  useEffect(() => {
    if (!sent) return undefined;
    const id = setTimeout(() => setSent(false), 2600);
    return () => clearTimeout(id);
  }, [sent]);
  // Restart the shake animation on every failed submit.
  const onInvalid = () => {
    const el = fields.current;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  };

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values);
      reset();
      setSent(true);
      toast({ tone: 'success', message: 'Message sent — I’ll reply within a day.' });
    } catch {
      toast({ tone: 'error', message: 'Could not send. Please email me directly.' });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div ref={fields} className="grid gap-4" onAnimationEnd={(e) => e.currentTarget.classList.remove('shake')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="name" label="Name" error={errors.name?.message} {...register('name')} />
          <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <Textarea id="message" label="Message" error={errors.message?.message} {...register('message')} />
      </div>
      <Button type="submit" loading={mutation.isPending} className="overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={sent ? 'sent' : mutation.isPending ? 'pending' : 'idle'}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="inline-flex items-center gap-1.5"
          >
            {sent ? (
              <><Check aria-hidden="true" size={17} /> Sent</>
            ) : mutation.isPending ? (
              'Sending…'
            ) : (
              <><Send aria-hidden="true" size={17} /> Send message</>
            )}
          </motion.span>
        </AnimatePresence>
      </Button>
    </form>
  );
}
