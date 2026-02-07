
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AccessDenied from './pages/AccessDenied';
import CreateUser from './pages/CreateUser';
import Transactions from './pages/Transactions';
import Invoices from './pages/Invoices';
import Debts from './pages/Debts';
import BankAccounts from './pages/BankAccounts';
import HandCash from './pages/HandCash';
import RecycleBin from './pages/RecycleBin';
import Settings from './pages/Settings';
import EmployeeProfile from './pages/EmployeeProfile';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Strict role-based routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <div style={{ padding: '2rem' }}>
                      <h2>Admin Panel</h2>
                      <p>Full system access, user and role management.</p>
                      <div className="d-flex gap-3 mt-3">
                        <a href="/admin/create-user" className="btn btn-primary">Create User</a>
                        <a href="/transactions" className="btn btn-success">Manage Transactions</a>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-user"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <CreateUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ProtectedRoute roles={['Accountant', 'Admin']}>
                    <div style={{ padding: '2rem' }}><h2>Finance</h2><p>Income, expenses, invoicing, payroll, taxation, reports.</p></div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr"
                element={
                  <ProtectedRoute roles={['HR', 'Admin']}>
                    <div style={{ padding: '2rem' }}><h2>HR</h2><p>Employee management, attendance, payroll view, payslip generation.</p></div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee"
                element={
                  <ProtectedRoute roles={['Employee']}>
                    <EmployeeProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <ProtectedRoute roles={['Auditor', 'Admin']}>
                    <div style={{ padding: '2rem' }}><h2>Audit</h2><p>Read-only access to financial reports.</p></div>
                  </ProtectedRoute>
                }
              />
              <Route path="/access-denied" element={<AccessDenied />} />
              {/* Transactions: Admin, Accountant (full); HR (payroll view); Employee (read-only view) */}
              <Route path="/transactions" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR', 'Employee']}><Transactions /></ProtectedRoute>} />
              {/* Invoices: Admin, Accountant (full); HR (salary view); Employee (own payslip only) */}
              <Route path="/invoices" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR', 'Employee']}><Invoices /></ProtectedRoute>} />
              {/* Debts: Admin, Accountant (full); HR (deductions view); Employee (own deductions only) */}
              <Route path="/debts" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR', 'Employee']}><Debts /></ProtectedRoute>} />
              {/* Bank Accounts: Admin, Accountant (full); HR (read-only); Employee (no access) */}
              <Route path="/bank-accounts" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR']}><BankAccounts /></ProtectedRoute>} />
              {/* Hand Cash: Admin, Accountant (full); HR (salary cash view); Employee (no access) */}
              <Route path="/hand-cash" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR']}><HandCash /></ProtectedRoute>} />
              {/* Employee Profile */}
              <Route path="/employee/profile" element={<ProtectedRoute roles={['Employee']}><EmployeeProfile /></ProtectedRoute>} />
              {/* Recycle Bin: Admin (all); Accountant (financial only); HR (employee only); Employee (no access) */}
              <Route path="/recycle-bin" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR']}><RecycleBin /></ProtectedRoute>} />
              {/* Settings: Admin (all); Accountant (finance); HR (payroll); Employee (profile only) */}
              <Route path="/settings" element={<ProtectedRoute roles={['Admin', 'Accountant', 'HR', 'Employee']}><Settings /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
