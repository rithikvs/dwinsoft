import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'HR',
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [success]);

  const { username, password, role } = formData;
  const email = username ? `${username}@dwinsoft.com` : '';

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username) {
      setError('Username is required.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/auth/create-user`,
        { username, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('User created successfully!');
      setFormData({ username: '', password: '', role: 'HR' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create User"
        subtitle="Provision new HR or Employee accounts with official credentials."
      />

      <SectionCard className="max-w-3xl">
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} autoComplete="off" className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</label>
              <input
                type="text"
                className="input-field mt-2"
                name="username"
                value={username}
                onChange={onChange}
                required
                placeholder="Enter username (e.g. rithik)"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Official Email</label>
              <input
                type="email"
                className="input-field mt-2"
                name="email"
                value={email}
                readOnly
                placeholder="user@dwinsoft.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <input
                type="password"
                className="input-field mt-2"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <select
                className="select-field mt-2"
                name="role"
                value={role}
                onChange={onChange}
              >
                <option value="HR">HR</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
          </div>

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Users</h3>
            <p className="text-sm text-slate-500">Overview of existing accounts in the system.</p>
          </div>
        </div>
        <div className="mt-4 max-h-72 overflow-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="font-semibold text-slate-900">{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default CreateUser;
