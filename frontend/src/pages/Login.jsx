import React, { useState, useContext } from 'react';
import Logo from '../assets/Logo';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginAnimated.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // Need to handle different error structures potentially
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
        }
    };

    return (
        <div className="animated-bg">
            <form className="animated-card" onSubmit={onSubmit} autoComplete="off">
                <Logo size={250} />
                <div className="animated-title" style={{ fontSize: 32, marginBottom: 16 }}>Sign In</div>
                {error && <div className="alert alert-danger text-center py-2">{error}</div>}
                <input
                    className="animated-input"
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={onChange}
                    required
                />
                <input
                    className="animated-input"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={onChange}
                    required
                />
                <button className="animated-btn" type="submit">Login</button>
                <div className="mt-3 text-center">
                    Don't have an account?{' '}
                    <Link className="animated-link" to="/register">Register</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
