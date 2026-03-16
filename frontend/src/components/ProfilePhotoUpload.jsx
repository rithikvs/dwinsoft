import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { FaCamera, FaTrash } from 'react-icons/fa';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate, theme }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isDark = theme === 'dark';

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            console.log('Uploading photo with token:', token ? 'Present' : 'Missing');
            const response = await axios.post(
                `${API_BASE_URL}/api/profile-photo/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Upload successful:', response.data);
            onPhotoUpdate(response.data.profilePhoto);
            setError(null);
        } catch (err) {
            console.error('Upload error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to upload photo';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm('Are you sure you want to delete your profile photo?')) return;

        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/profile-photo/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onPhotoUpdate(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete photo');
        } finally {
            setLoading(false);
        }
    };

    const containerBg = isDark ? '#1e293b' : '#f8fafc';
    const borderColor = isDark ? '#334155' : '#e2e8f0';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';

    return (
        <div style={{
            background: containerBg,
            border: `2px dashed ${borderColor}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                {currentPhoto ? (
                    <img
                        src={`http://localhost:5000${currentPhoto}`}
                        alt="Profile"
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `3px solid #2563eb`,
                            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: isDark ? '#334155' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#2563eb'
                    }}>
                        <FaCamera />
                    </div>
                )}
            </div>

            <h5 style={{ color: textColor, marginBottom: '0.5rem' }}>
                {currentPhoto ? 'Update Profile Photo' : 'Upload Profile Photo'}
            </h5>

            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                JPG, PNG or GIF (Max 5MB)
            </p>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    border: '1px solid #fecaca'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <label style={{
                display: 'inline-block',
                background: '#2563eb',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginRight: '0.5rem'
            }}>
                {loading ? 'Uploading...' : 'Choose Photo'}
                <input
                    type="file"
                    onChange={handlePhotoChange}
                    disabled={loading}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
            </label>

            {currentPhoto && (
                <button
                    onClick={handleDeletePhoto}
                    disabled={loading}
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.5rem 1.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <FaTrash /> Delete Photo
                </button>
            )}
        </div>
    );
};

export default ProfilePhotoUpload;
