import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

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
    <div>
      <h2>Settings</h2>
      <div className="card p-4 mt-4">
        <h5>Appearance</h5>
        <div className="mb-4">
          <label className="form-label">Theme</label>
          <select
            className="form-select"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <div className="form-text">Choose between light and dark mode. Applies to the whole website.</div>
        </div>
        <h5>Account</h5>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          {success && <div className="text-success mt-2">Account updated successfully!</div>}
          {error && <div className="text-danger mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Settings;
