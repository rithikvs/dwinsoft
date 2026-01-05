import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
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
        <div>
            <h2 className="mb-4">Welcome back, {user?.username}</h2>

            {/* Only show cards if real data is loaded */}
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                    <Spinner animation="border" />
                </div>
            ) : stats ? (
                <>
                    <Row>
                        <Col md={3}>
                            <DashboardCard title="Total Users" value={stats.totalUsers} color="primary" />
                        </Col>
                        <Col md={3}>
                            <DashboardCard title="Revenue" value={`$${stats.revenue}`} color="success" />
                        </Col>
                        <Col md={3}>
                            <DashboardCard title="Pending Approvals" value={stats.pendingApprovals} color="warning" />
                        </Col>
                        <Col md={3}>
                            <DashboardCard title="System Alerts" value={stats.systemAlerts} color="danger" />
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col md={12}>
                            <Card className="shadow-sm">
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
                <div className="text-center text-muted">Noo data available.</div>
            )}
        </div>
    );
};

export default Dashboard;
