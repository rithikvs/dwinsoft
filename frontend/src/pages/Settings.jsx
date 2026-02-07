import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const Settings = () => {
  const { user, token } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await axios.put('http://localhost:5000/api/auth/me', { username: name, email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
    } catch (err) {
      setError('Failed to update account info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Personalize the workspace and keep your account details up to date."
      />

      <SectionCard>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
            <p className="mt-1 text-sm text-slate-500">Choose between light and dark mode for the console.</p>
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Theme</label>
              <select
                className="select-field mt-2"
                value={theme}
                onChange={e => setTheme(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Account</h3>
            <p className="mt-1 text-sm text-slate-500">Update your display name and contact email.</p>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                <input
                  type="text"
                  className="input-field mt-2"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                <input
                  type="email"
                  className="input-field mt-2"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {success && <div className="text-sm text-emerald-600">Account updated successfully!</div>}
              {error && <div className="text-sm text-rose-600">{error}</div>}
            </form>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
