import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors, colorPalette } from '../utils/colors';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard, FiArrowRight, FiCalendar, FiFileText, FiLayers } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [stats, setStats] = useState({
        income: 0, expense: 0, balance: 0,
        transactionCount: 0, totalHandCash: 0,
        totalBankBalance: 0, handCashCount: 0, bankAccountCount: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [handCashRecords, setHandCashRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getPaymentMethodLabel = (t) => {
        if (t?.paymentMethod) return t.paymentMethod;
        if (t?.bankAccountId) return 'Bank Account';
        if (t?.handCashId) return 'Hand Cash';
        return '';
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const transRes = await axios.get(`${API_BASE_URL}/api/transactions`);
            const transactions = transRes.data;
            const [bankRes, handCashRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/bank-accounts`),
                axios.get(`${API_BASE_URL}/api/hand-cash`)
            ]);
            const bankAccounts = bankRes.data;
            const handCashData = handCashRes.data;
            setHandCashRecords(handCashData);

            let income = 0, expense = 0, handCashIncome = 0, handCashExpense = 0;
            transactions.forEach(t => {
                if (t.type === 'Income') income += t.amount;
                else if (t.type === 'Expense') expense += t.amount;
                const method = getPaymentMethodLabel(t);
                if (method === 'Hand Cash') {
                    if (t.type === 'Income') handCashIncome += t.amount;
                    else if (t.type === 'Expense') handCashExpense += t.amount;
                }
            });

            const totalBankBalance = bankAccounts.reduce((s, ba) => s + (ba.balance || 0), 0);
            const hcRecordIncome = handCashData.filter(hc => hc.type === 'Income' || !hc.type).reduce((s, hc) => s + (hc.amount || 0), 0);
            const hcRecordExpense = handCashData.filter(hc => hc.type === 'Expense').reduce((s, hc) => s + (hc.amount || 0), 0);
            const combinedIncome = income + hcRecordIncome;
            const combinedExpense = expense + hcRecordExpense;

            setStats({
                income: combinedIncome, expense: combinedExpense,
                balance: combinedIncome - combinedExpense,
                transactionCount: transactions.length,
                totalHandCash: (handCashIncome - handCashExpense) + (hcRecordIncome - hcRecordExpense),
                totalBankBalance, handCashCount: handCashData.length,
                bankAccountCount: bankAccounts.length
            });
            setRecentTransactions(transactions.slice(0, 5));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const fmt = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (user?.role === 'Employee') return <EmployeeDashboard />;

    // ── Theme Tokens ──
    const colors = getThemeColors(isDark);
    const { cardBg, textColor: text, mutedColor: muted, borderColor: border } = colors;

    const hcIncome = handCashRecords.filter(hc => hc.type === 'Income' || !hc.type).reduce((s, hc) => s + (hc.amount || 0), 0);
    const hcExpense = handCashRecords.filter(hc => hc.type === 'Expense').reduce((s, hc) => s + (hc.amount || 0), 0);
    const hcNet = hcIncome - hcExpense;

    // ── Stat Card Config ──
    const statCards = [
        {
            title: 'Total Income', value: fmt(stats.income), sub: 'Transactions + Hand Cash',
            gradient: `linear-gradient(135deg, ${colorPalette.status.success}, ${colorPalette.status.success}dd)`, icon: <FiTrendingUp size={22} />,
            shadow: 'rgba(16, 185, 129, 0.35)'
        },
        {
            title: 'Total Expenses', value: fmt(stats.expense), sub: 'Transactions + Hand Cash',
            gradient: `linear-gradient(135deg, ${colorPalette.status.error}, #f87171)`, icon: <FiTrendingDown size={22} />,
            shadow: 'rgba(239, 68, 68, 0.35)'
        },
        {
            title: 'Net Balance', value: fmt(stats.balance), sub: 'Income − Expenses',
            gradient: stats.balance >= 0
                ? `linear-gradient(135deg, ${colorPalette.primary.base}, ${colorPalette.primary.light})`
                : `linear-gradient(135deg, ${colorPalette.status.error}, ${colorPalette.status.error}cc)`,
            icon: <FiDollarSign size={22} />,
            shadow: stats.balance >= 0 ? 'rgba(37, 99, 235, 0.35)' : 'rgba(239, 68, 68, 0.35)'
        },
        {
            title: 'Bank Balance', value: fmt(stats.totalBankBalance), sub: `${stats.bankAccountCount} account${stats.bankAccountCount !== 1 ? 's' : ''}`,
            gradient: `linear-gradient(135deg, ${colorPalette.status.warning}, #fbbf24)`, icon: <FiCreditCard size={22} />,
            shadow: 'rgba(217, 119, 6, 0.35)'
        }
    ];

    // ── Quick Links ──
    const quickLinks = [
        { label: 'Transactions', icon: <FiFileText size={18} />, path: '/transactions', color: colorPalette.primary.base },
        { label: 'Hand Cash', icon: <FiDollarSign size={18} />, path: '/hand-cash', color: colorPalette.status.success },
        { label: 'Bank Accounts', icon: <FiCreditCard size={18} />, path: '/bank-accounts', color: '#2563eb' },
        { label: 'Invoices', icon: <FiLayers size={18} />, path: '/invoices', color: colorPalette.status.warning },
    ];

    return (
        <div style={{ padding: '1.5rem 2rem' }}>

            {/* ── Welcome Banner ── */}
            <div style={{
                background: isDark
                    ? `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.darkest} 100%)`
                    : `linear-gradient(135deg, ${colorPalette.primary.base} 0%, ${colorPalette.primary.medium} 100%)`,
                borderRadius: '20px', padding: '2rem 2.5rem', marginBottom: '2rem',
                color: '#fff', position: 'relative', overflow: 'hidden',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : `0 8px 32px ${colorPalette.primary.base}4d`,
            }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', right: '80px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.75rem', fontWeight: 700 }}>
                        Welcome back, {user?.name || 'User'} 👋
                    </h2>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '1rem' }}>Here's your financial overview at a glance.</p>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {statCards.map((c, i) => (
                    <div key={i} style={{
                        background: c.gradient, borderRadius: '18px', padding: '1.5rem 1.75rem',
                        color: '#fff', position: 'relative', overflow: 'hidden',
                        boxShadow: `0 8px 24px ${c.shadow}`,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        cursor: 'default',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.9 }}>{c.title}</span>
                            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.4rem', display: 'flex' }}>{c.icon}</div>
                        </div>
                        <div style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.2 }}>{c.value}</div>
                        <div style={{ fontSize: '0.72rem', marginTop: '0.5rem', opacity: 0.75 }}>{c.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Two-Column Layout: Transactions + Hand Cash ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* ─ Recent Transactions ─ */}
                <div style={{
                    background: cardBg, borderRadius: '18px', border: `1px solid ${border}`,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1.25rem 1.5rem', borderBottom: `1px solid ${border}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                background: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe',
                                borderRadius: '10px', padding: '0.5rem', display: 'flex',
                            }}>
                                <FiFileText size={18} color="#3b82f6" />
                            </div>
                            <h6 style={{ margin: 0, fontWeight: 700, color: text, fontSize: '1rem' }}>Recent Transactions</h6>
                        </div>
                        <button
                            onClick={() => navigate('/transactions')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.4rem 1rem', borderRadius: '999px', border: `1px solid ${border}`,
                                background: 'transparent', color: colorPalette.primary.base, fontSize: '0.8rem',
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = colorPalette.primary.base; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colorPalette.primary.base; }}
                        >
                            View All <FiArrowRight size={14} />
                        </button>
                    </div>

                    <div style={{ padding: '0.25rem 0' }}>
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((t, i) => (
                                <div key={t._id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.85rem 1.5rem',
                                    borderBottom: i < recentTransactions.length - 1 ? `1px solid ${border}` : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1a2744' : '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '10px',
                                            background: t.type === 'Income'
                                                ? (isDark ? 'rgba(16, 185, 129, 0.15)' : colorPalette.status.successLight)
                                                : (isDark ? 'rgba(239, 68, 68, 0.15)' : colorPalette.status.errorLight),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            {t.type === 'Income' ? <FiTrendingUp size={18} color={colorPalette.status.success} /> : <FiTrendingDown size={18} color={colorPalette.status.error} />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.72rem', color: muted }}>
                                                    <FiCalendar size={11} style={{ marginRight: '3px', verticalAlign: '-1px' }} />
                                                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px',
                                                    background: isDark ? '#334155' : '#f1f5f9', color: muted, fontWeight: 500
                                                }}>{t.category}</span>
                                                <span style={{
                                                    fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px',
                                                    background: getPaymentMethodLabel(t) === 'Hand Cash'
                                                        ? (isDark ? 'rgba(245, 158, 11, 0.15)' : colorPalette.status.warningLight)
                                                        : (isDark ? 'rgba(37, 99, 235, 0.15)' : '#e0e7ff'),
                                                    color: getPaymentMethodLabel(t) === 'Hand Cash' ? colorPalette.status.warning : colorPalette.primary.base,
                                                    fontWeight: 500,
                                                }}>{getPaymentMethodLabel(t) || 'Bank'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', marginLeft: '1rem',
                                        color: t.type === 'Income' ? colorPalette.status.success : colorPalette.status.error,
                                    }}>
                                        {t.type === 'Income' ? '+' : '−'}{fmt(t.amount)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: muted, fontSize: '0.9rem' }}>
                                No recent transactions found.
                            </div>
                        )}
                    </div>
                </div>

                {/* ─ Hand Cash Summary Card ─ */}
                <div style={{
                    background: cardBg, borderRadius: '18px', border: `1px solid ${border}`,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1.25rem 1.5rem', borderBottom: `1px solid ${border}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                background: isDark ? `rgba(16, 185, 129, 0.15)` : colorPalette.status.successLight,
                                borderRadius: '10px', padding: '0.5rem', display: 'flex',
                            }}>
                                <FiDollarSign size={18} color={colorPalette.status.success} />
                            </div>
                            <h6 style={{ margin: 0, fontWeight: 700, color: text, fontSize: '1rem' }}>Hand Cash</h6>
                        </div>
                        <button
                            onClick={() => navigate('/hand-cash')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.4rem 1rem', borderRadius: '999px', border: `1px solid ${border}`,
                                background: 'transparent', color: '#10b981', fontSize: '0.8rem',
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                        >
                            Manage <FiArrowRight size={14} />
                        </button>
                    </div>

                    <div style={{ padding: '1.25rem 1.5rem', flex: 1 }}>
                        {/* Net Balance Highlight */}
                        <div style={{
                            background: hcNet >= 0
                                ? (isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5')
                                : (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'),
                            borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem',
                            border: `1px solid ${hcNet >= 0 ? (isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0') : (isDark ? 'rgba(239,68,68,0.25)' : '#fecdd3')}`,
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.3rem' }}>Net Hand Cash</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: hcNet >= 0 ? '#10b981' : '#ef4444' }}>{fmt(hcNet)}</div>
                            <div style={{ fontSize: '0.72rem', color: muted, marginTop: '0.2rem' }}>{handCashRecords.length} record{handCashRecords.length !== 1 ? 's' : ''}</div>
                        </div>

                        {/* Income / Expense Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.85rem 1rem', borderRadius: '12px',
                                background: isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
                                border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#bbf7d0'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiTrendingUp size={16} color="#10b981" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: text }}>Income</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>+{fmt(hcIncome)}</span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.85rem 1rem', borderRadius: '12px',
                                background: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
                                border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#fecdd3'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiTrendingDown size={16} color="#ef4444" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: text }}>Expense</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>−{fmt(hcExpense)}</span>
                            </div>
                        </div>

                        {/* Latest records */}
                        {handCashRecords.length > 0 && (
                            <div style={{ marginTop: '1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.6rem' }}>Latest Records</div>
                                {handCashRecords.slice(0, 3).map(hc => (
                                    <div key={hc._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.55rem 0', borderBottom: `1px solid ${border}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '8px',
                                                background: (hc.type || 'Income') === 'Income'
                                                    ? (isDark ? 'rgba(16,185,129,0.15)' : '#d1fae5')
                                                    : (isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2'),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                                            }}>
                                                {(hc.type || 'Income') === 'Income' ? '💰' : '💸'}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: text }}>{hc.holder}</div>
                                                <div style={{ fontSize: '0.68rem', color: muted }}>{hc.description || '—'}</div>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontWeight: 700, fontSize: '0.85rem',
                                            color: (hc.type || 'Income') === 'Income' ? '#10b981' : '#ef4444',
                                        }}>
                                            {(hc.type || 'Income') === 'Income' ? '+' : '−'}{fmt(hc.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick Navigation ── */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
            }}>
                {quickLinks.map((link, i) => (
                    <button key={i} onClick={() => navigate(link.path)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '1rem 1.25rem', borderRadius: '14px',
                        background: cardBg, border: `1px solid ${border}`,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.04)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = link.color; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = border; }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: `${link.color}18`, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            {React.cloneElement(link.icon, { color: link.color })}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: text }}>{link.label}</div>
                            <div style={{ fontSize: '0.7rem', color: muted }}>View &amp; Manage</div>
                        </div>
                        <FiArrowRight size={16} color={muted} style={{ marginLeft: 'auto' }} />
                    </button>
                ))}
            </div>

            {/* ── Responsive breakpoints ── */}
            <style>{`
                @media (max-width: 1100px) {
                    /* handled by inline auto-fit where applicable */
                }
                @media (max-width: 768px) {
                    div { font-size: 0.92rem; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
