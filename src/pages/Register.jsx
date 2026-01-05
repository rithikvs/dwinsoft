import React, { useState, useContext } from 'react';
import Logo from '../assets/Logo';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginAnimated.css';

const Register = () => {
    const [formData, setFormData] = useState(() => {
        const savedEmail = localStorage.getItem('registeredEmail') || '';
        return {
            username: '',
            email: savedEmail,
            password: '',
            confirmPassword: '',
            role: 'Accountant'
        };
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const { username, email, password, confirmPassword, role } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await register(username, email, password, role);
            localStorage.setItem('registeredEmail', email);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
        }
    };

    return (
        <div className="animated-bg">
            <form className="animated-card" onSubmit={onSubmit} autoComplete="off">
                <Logo size={250} />
                <div className="animated-title" style={{ fontSize: 32, marginBottom: 16 }}>Sign Up</div>
                <input
                    className="animated-input"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={onChange}
                    required
                />
                <input
                    className="animated-input"
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={onChange}
                    required
                />
                <select
                    className="animated-input"
                    name="role"
                    value={role}
                    onChange={onChange}
                    required
                >
                    <option value="Admin">Admin</option>
                    <option value="Accountant">Accountant</option>
                    <option value="HR">HR</option>
                    <option value="Employee">Employee</option>
                    <option value="Auditor">Auditor</option>
                </select>
                <input
                    className="animated-input"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={onChange}
                    required
                />
                <input
                    className="animated-input"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                />
                <button className="animated-btn" type="submit">Continue</button>
                {error && <div className="text-danger text-center mt-2">{error}</div>}
                <div className="mt-3 text-center">
                    Already have an account?{' '}
                    <Link className="animated-link" to="/login">Login</Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
