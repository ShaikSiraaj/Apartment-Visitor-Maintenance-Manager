import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { alertAPI } from '../services/api';
import { LogIn, KeyRound, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Visitor Complaint Modal state
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitorAlert, setVisitorAlert] = useState({
    name: '',
    title: '',
    description: '',
  });
  const [alertSuccess, setAlertSuccess] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Resident') navigate('/resident');
      else if (user.role === 'Security Guard') navigate('/security');
      else navigate('/visitors');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorComplaintSubmit = async (e) => {
    e.preventDefault();
    setAlertSuccess('');
    try {
      await alertAPI.create({
        title: visitorAlert.title,
        description: visitorAlert.description,
        raisedBy: visitorAlert.name || 'Visitor / Guest',
        role: 'Visitor',
        urgency: 'High',
      });
      setAlertSuccess('Complaint alert sent directly to Admin! Thank you.');
      setVisitorAlert({ name: '', title: '', description: '' });
      setTimeout(() => setShowVisitorModal(false), 2000);
    } catch (err) {
      alert('Failed to submit visitor complaint.');
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4 style-card" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-2">
            <LogIn size={32} />
          </div>
          <h3 className="fw-bold">Welcome Back</h3>
          <p className="text-muted small">Apartment Visitor & Maintenance Manager</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text"><Mail size={18} /></span>
              <input
                type="email"
                className="form-control"
                placeholder="user@apartment.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Password</label>
            <div className="input-group">
              <span className="input-group-text"><KeyRound size={18} /></span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold py-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center border-top pt-3">
          <p className="text-muted small mb-2">
            Don't have an account? <Link to="/register" className="fw-bold text-primary">Register Here</Link>
          </p>
          <button
            onClick={() => setShowVisitorModal(true)}
            className="btn btn-outline-danger btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
          >
            <AlertTriangle size={16} /> Raise Visitor / Public Complaint Alert
          </button>
        </div>
      </div>

      {/* Visitor / Guest Complaint Modal */}
      {showVisitorModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <AlertTriangle size={20} /> Raise Visitor Complaint Alert to Admin
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowVisitorModal(false)}
                ></button>
              </div>
              <form onSubmit={handleVisitorComplaintSubmit}>
                <div className="modal-body">
                  {alertSuccess && <div className="alert alert-success py-2">{alertSuccess}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Your Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Visitor / Guest Name"
                      value={visitorAlert.name}
                      onChange={(e) => setVisitorAlert({ ...visitorAlert, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Complaint Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Issue title"
                      value={visitorAlert.title}
                      onChange={(e) => setVisitorAlert({ ...visitorAlert, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Complaint Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Describe your issue or complaint for the apartment admin..."
                      value={visitorAlert.description}
                      onChange={(e) => setVisitorAlert({ ...visitorAlert, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowVisitorModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm fw-bold">
                    Submit Complaint to Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
