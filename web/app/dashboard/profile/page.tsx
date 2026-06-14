'use client';

import * as React from 'react';
import {apiFetch, apiUpload} from '@/lib/api-client';
import type {User} from '@/lib/types';
import {Spinner} from '@/components/dashboard/StatCard';
import {Icon} from '@/components/icons';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100';

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true);

  // Profile form
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState('');
  const [profileErr, setProfileErr] = React.useState('');

  // Password form
  const [current, setCurrent] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [pwConfirm, setPwConfirm] = React.useState('');
  const [savingPw, setSavingPw] = React.useState(false);
  const [pwMsg, setPwMsg] = React.useState('');
  const [pwErr, setPwErr] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<User>('/auth/me');
        setName(me.name);
        setPhone(me.phone ?? '');
        setEmail(me.email);
        setAvatar(me.avatar ?? null);
      } catch {
        // handled by api-client 401 redirect
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({name: name.trim(), phone: phone.trim(), email: email.trim()}),
      });
      setProfileMsg('Profile updated.');
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg('');
    setPwErr('');
    if (pw !== pwConfirm) {
      setPwErr('Passwords do not match.');
      setSavingPw(false);
      return;
    }
    try {
      await apiFetch('/password', {
        method: 'PUT',
        body: JSON.stringify({current_password: current, password: pw, password_confirmation: pwConfirm}),
      });
      setPwMsg('Password changed.');
      setCurrent('');
      setPw('');
      setPwConfirm('');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setProfileErr('');
    try {
      const fd = new FormData();
      fd.append('_method', 'PUT'); // Laravel can't parse multipart on PUT
      fd.append('avatar', file);
      const updated = await apiUpload<User>('/profile', fd);
      setAvatar(updated.avatar ?? null);
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Avatar upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  };

  const initials = name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-ink-soft">Manage your account details.</p>

      <div className="mt-8 flex items-center gap-5 rounded-2xl border border-line bg-white p-6 shadow-soft">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-50 text-xl font-bold text-primary">
            {initials || 'U'}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-ink">Profile photo</p>
          <p className="text-sm text-ink-muted">JPG, PNG or WebP, up to 2 MB.</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-alt disabled:opacity-60">
            <Icon name="download" width={15} height={15} className="rotate-180" />
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPickAvatar}
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={saveProfile} className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink sm:col-span-2">
            Full name
            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-ink">
            Phone
            <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-ink">
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </label>
        </div>
        {profileErr ? <p className="mt-3 text-sm text-red-500">{profileErr}</p> : null}
        {profileMsg ? <p className="mt-3 text-sm text-accent-600">{profileMsg}</p> : null}
        <button
          type="submit"
          disabled={savingProfile}
          className="mt-5 cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60">
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={savePassword} className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Change password</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink sm:col-span-2">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={pwConfirm}
              onChange={e => setPwConfirm(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        {pwErr ? <p className="mt-3 text-sm text-red-500">{pwErr}</p> : null}
        {pwMsg ? <p className="mt-3 text-sm text-accent-600">{pwMsg}</p> : null}
        <button
          type="submit"
          disabled={savingPw}
          className="mt-5 cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60">
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
