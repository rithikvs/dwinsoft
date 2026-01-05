
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, Row, Col, Spinner, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaUser, FaMoneyBill, FaBell, FaClipboardList, FaPlus, FaExchangeAlt, FaUsers, FaCog } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Replace with your backend API endpoints for real data
                const [usersRes, revenueRes, approvalsRes, alertsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/stats/users'),
                    axios.get('http://localhost:5000/api/stats/revenue'),
                    axios.get('http://localhost:5000/api/stats/pending-approvals'),
                    axios.get('http://localhost:5000/api/stats/system-alerts'),
                ]);
                setStats({
                    totalUsers: usersRes.data.count,
                    revenue: revenueRes.data.amount,
                    pendingApprovals: approvalsRes.data.count,
                    systemAlerts: alertsRes.data.count,
                });
            } catch (err) {
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const DashboardCard = ({ title, value, color }) => (
        <Card className={`text-white bg-${color} mb-3 shadow-sm`}>
            <Card.Header>{title}</Card.Header>
            <Card.Body>
                <Card.Title style={{ fontSize: '2rem' }}>{value}</Card.Title>
            </Card.Body>
        </Card>
    );

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-1">Welcome back, {user?.username}</h2>
            <div className="mb-4 text-muted" style={{ fontSize: '1.1rem' }}>
                Here’s a quick overview of your system today.
            </div>

            {/* Summary Cards */}
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                    <Spinner animation="border" />
                </div>
            ) : stats ? (
                <>
                    <Row className="g-3 mb-4">
                        <Col md={3} sm={6} xs={12}>
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaUser size={32} className="mb-2 text-primary" />
                                    <div className="fw-bold">Total Users</div>
                                    <div style={{ fontSize: '1.7rem' }}>{stats.totalUsers}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} xs={12}>
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaMoneyBill size={32} className="mb-2 text-success" />
                                    <div className="fw-bold">Revenue</div>
                                    <div style={{ fontSize: '1.7rem' }}>${stats.revenue?.toLocaleString()}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} xs={12}>
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaClipboardList size={32} className="mb-2 text-warning" />
                                    <div className="fw-bold">Pending Approvals</div>
                                    <div style={{ fontSize: '1.7rem' }}>{stats.pendingApprovals}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6} xs={12}>
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaBell size={32} className="mb-2 text-danger" />
                                    <div className="fw-bold">System Alerts</div>
                                    <div style={{ fontSize: '1.7rem' }}>{stats.systemAlerts}</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Quick Actions */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="shadow-sm">
                                <Card.Header as="h5">Quick Actions</Card.Header>
                                <Card.Body>
                                    <div className="d-flex flex-wrap gap-3">
                                        <Button variant="primary" className="d-flex align-items-center gap-2">
                                            <FaPlus /> Add Transaction
                                        </Button>
                                        <Button variant="success" className="d-flex align-items-center gap-2">
                                            <FaExchangeAlt /> View Transactions
                                        </Button>
                                        <Button variant="info" className="d-flex align-items-center gap-2">
                                            <FaUsers /> Manage Users
                                        </Button>
                                        <Button variant="secondary" className="d-flex align-items-center gap-2">
                                            <FaCog /> Settings
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent Activity */}
                    <Row>
                        <Col md={7} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Header as="h5">Recent Activity</Card.Header>
                                <div className="text-muted p-3">No recent activity to display.</div>
                            </Card>
                        </Col>
                        <Col md={5} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Header as="h5">
                                    {user?.role === 'Admin' ? 'System Overview' :
                                        user?.role === 'Accountant' ? 'Financial Reports' :
                                            user?.role === 'HR' ? 'Employee Stats' : 'Overview'}
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        {user?.role === 'Admin' && <p>You have full access to system settings, user management, and logs.</p>}
                                        {user?.role === 'Accountant' && <p>View latest transactions, generate profit/loss reports, and manage payroll.</p>}
                                        {user?.role === 'HR' && <p>Manage employee records, recruitment pipelines, and attendance.</p>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            ) : (
                <div className="text-center text-muted">No data available.</div>
            )}
        </div>
    );
};

export default Dashboard;
