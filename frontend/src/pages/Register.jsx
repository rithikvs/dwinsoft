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
