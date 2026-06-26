import { useState } from 'react';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useProfile, useUpdateProfile } from '../../features/profile/api/profile.queries.js';

const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export default function ProfileAdmin() {
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const profile = profileQuery.data;
  const [resumeError, setResumeError] = useState('');

  const { register, handleSubmit } = useForm({
    values: {
      name: profile?.name || '',
      role: profile?.role || '',
      headline: profile?.headline || '',
      bio: profile?.bio || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || ''
    }
  });

  if (profileQuery.isLoading && !profile) return <Spinner />;

  const submit = (values) => {
    const resumeFile = values.resume?.[0] || null;
    if (resumeFile) {
      if (resumeFile.type !== 'application/pdf') {
        setResumeError('Upload a PDF file.');
        return;
      }
      if (resumeFile.size > MAX_RESUME_BYTES) {
        setResumeError('PDF must be 10 MB or smaller.');
        return;
      }
    }
    setResumeError('');
    updateProfile.mutate({
      name: values.name,
      role: values.role,
      headline: values.headline,
      bio: values.bio,
      email: values.email,
      phone: values.phone,
      location: values.location,
      resumeFile,
      currentResumePath: profile?.resumePath || null
    });
  };

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
        <div className="grid gap-1.5">
          <label htmlFor="resume" className="font-mono text-xs uppercase text-muted">
            Resume (PDF)
          </label>
          {profile?.resumeUrl ? (
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="justify-self-start text-sm text-accent underline">
              View current resume
            </a>
          ) : (
            <p className="text-sm text-muted">No resume uploaded yet.</p>
          )}
          <input id="resume" type="file" accept="application/pdf,.pdf" className="rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted" {...register('resume')} />
          <p className="text-xs text-muted">Uploading a new PDF replaces the current one (max 10 MB).</p>
          {resumeError ? <p role="alert" className="text-sm text-danger">{resumeError}</p> : null}
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          <Save aria-hidden="true" size={17} />
          {updateProfile.isPending ? 'Saving...' : updateProfile.isSuccess ? 'Saved' : 'Save profile'}
        </Button>
      </form>
    </section>
  );
}
