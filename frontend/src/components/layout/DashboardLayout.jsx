import React, { useContext } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaFileInvoice, FaMoneyBillWave, FaUniversity, FaHandHoldingUsd, FaRecycle, FaCog, FaSignOutAlt, FaUserCircle, FaIdBadge, FaRupeeSign } from 'react-icons/fa';

const DashboardLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const location = useLocation();
    // Role-based navigation links
    const role = user?.role;
    const navLinks = [
        { to: '/', label: 'Dashboard', icon: <FaHome />, roles: ['Admin','Accountant','HR','Employee'] },
        { to: '/transactions', label: 'Transactions', icon: <FaExchangeAlt />, roles: ['Admin','Accountant','HR','Employee'] },
        { to: '/invoices', label: 'Invoices', icon: <FaFileInvoice />, roles: ['Admin','Accountant','HR','Employee'] },
        { to: '/debts', label: 'Debts', icon: <FaMoneyBillWave />, roles: ['Admin','Accountant','HR','Employee'] },
        { to: '/bank-accounts', label: 'Bank Accounts', icon: <FaUniversity />, roles: ['Admin','Accountant','HR'] },
        { to: '/hand-cash', label: 'Hand Cash', icon: <FaHandHoldingUsd />, roles: ['Admin','Accountant','HR'] },
        { to: '/recycle-bin', label: 'Recycle Bin', icon: <FaRecycle />, roles: ['Admin','Accountant','HR'] },
        { to: '/employee/profile', label: 'My Profile', icon: <FaIdBadge />, roles: ['Employee'] },
        { to: '/my-profile', label: 'My Profile', icon: <FaIdBadge />, roles: ['HR'] },
        { to: '/admin/salary', label: 'Salary Management', icon: <FaRupeeSign />, roles: ['Admin'] },
        { to: '/settings', label: 'Settings', icon: <FaCog />, roles: ['Admin','Accountant','HR','Employee'] },
        // Admin-only: Create User
        { to: '/admin/create-user', label: 'Create User', icon: <FaUserCircle />, roles: ['Admin'] },
    ];
    return (
        <div className="d-flex" style={{ height: '100vh', overflow: 'hidden', background: theme === 'dark' ? '#181c24' : undefined }}>
            {/* Sidebar */}
            <div className={theme === 'dark' ? 'bg-dark border-end p-0 d-flex flex-column' : 'bg-white border-end p-0 d-flex flex-column'} style={{ width: '250px', flexShrink: 0, minHeight: '100vh' }}>
                <div className="d-flex align-items-center justify-content-center py-4 border-bottom">
                    <img src="/image.png" alt="Dwinsoft Logo" style={{ width: 300, height: 70, marginBottom: 8, objectFit: 'contain', filter: theme === 'dark' ? 'brightness(0.9)' : undefined }} />
                </div>
                <Nav className="flex-column flex-grow-1 pt-3">
                    {navLinks.filter(link => link.roles.includes(role)).map(link => (
                        <Nav.Link
                            as={Link}
                            to={link.to}
                            key={link.to}
                            className={`d-flex align-items-center px-4 py-2 mb-1 ${location.pathname === link.to ? (theme === 'dark' ? 'active bg-primary text-white' : 'active bg-primary text-white') : (theme === 'dark' ? 'text-light' : 'text-dark')}`}
                            style={{ borderRadius: 8, fontWeight: 500, background: location.pathname === link.to ? undefined : undefined }}
                        >
                            <span className="me-3" style={{ fontSize: 18 }}>{link.icon}</span> {link.label}
                        </Nav.Link>
                    ))}
                </Nav>
                <div className="mt-auto border-top p-3">
                    <div className="d-flex align-items-center mb-2">
                        <FaUserCircle className="me-2" style={{ fontSize: 22, color: theme === 'dark' ? '#8ecfff' : undefined }} />
                        <div>
                            <div style={{ fontWeight: 600 }}>{user?.username || 'User'}</div>
                            <div style={{ fontSize: 13, color: theme === 'dark' ? '#b0b0b0' : '#888' }}>{user?.email || 'info@dwinsoft.in'}</div>
                        </div>
                    </div>
                    <Button variant="danger" className="w-100" onClick={handleLogout}>
                        <FaSignOutAlt className="me-2" /> Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto', background: theme === 'dark' ? '#181c24' : '#f7f8fa' }}>
                <Navbar bg={theme === 'dark' ? 'dark' : 'white'} expand="lg" className={theme === 'dark' ? 'border-bottom px-4 navbar-dark' : 'border-bottom px-4'} style={{ minHeight: 64 }}>
                    <Container fluid>
                        <Navbar.Brand className="fw-bold fs-4" style={{ color: theme === 'dark' ? '#8ecfff' : undefined }}>{navLinks.find(l => l.to === location.pathname)?.label || 'Dashboard'}</Navbar.Brand>
                        <Navbar.Toggle />
                        <Navbar.Collapse className="justify-content-end">
                            <Navbar.Text className={theme === 'dark' ? 'text-light' : 'text-muted'}>
                                Manage your account settings and preferences
                            </Navbar.Text>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Container fluid className="p-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default DashboardLayout;
