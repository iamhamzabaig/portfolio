import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProfile, useUpdateProfile } from '../../features/profile/api/profile.queries.js';

export default function ProfileAdmin() {
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const profile = profileQuery.data;

  const { register, handleSubmit } = useForm({
    values: {
      name: profile?.name || '',
      role: profile?.role || '',
      headline: profile?.headline || '',
      bio: profile?.bio || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      resumeUrl: profile?.resumeUrl || ''
    }
  });

  if (profileQuery.isLoading && !profile) return <Spinner />;

  const submit = (values) => updateProfile.mutate(values);

  return (
    <section className="max-w-2xl">
      <h1 className="mb-6 text-3xl font-semibold">Profile</h1>
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <Input id="name" label="Name" {...register('name')} />
        <Input id="role" label="Role" {...register('role')} />
        <Input id="headline" label="Headline" {...register('headline')} />
        <Textarea id="bio" label="Bio" {...register('bio')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="email" label="Email" {...register('email')} />
          <Input id="phone" label="Phone" {...register('phone')} />
        </div>
        <Input id="location" label="Location" {...register('location')} />
        <Input id="resumeUrl" label="Resume URL" placeholder="https://… link to your résumé PDF" {...register('resumeUrl')} />
        <Button type="submit" disabled={updateProfile.isPending}>
          <Save aria-hidden="true" size={17} />
          {updateProfile.isPending ? 'Saving...' : updateProfile.isSuccess ? 'Saved' : 'Save profile'}
        </Button>
      </form>
    </section>
  );
}
