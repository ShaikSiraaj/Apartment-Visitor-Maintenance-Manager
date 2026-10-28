import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apartmentAPI } from '../services/api';
import { UserPlus, Mail, KeyRound, User, Shield, Building } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Resident',
    apartmentId: '',
  });
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const res = await apartmentAPI.getAll();
        setApartments(res.data);
      } catch (err) {
        console.error('Failed to load apartments', err);
      }
    };
    fetchApartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData);
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Resident') navigate('/resident');
      else if (user.role === 'Security Guard') navigate('/security');
      else navigate('/visitors');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="card shadow-lg p-4 style-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="bg-success text-white rounded-circle d-inline-flex p-3 mb-2">
            <UserPlus size={32} />
          </div>
          <h3 className="fw-bold">Create Account</h3>
          <p className="text-muted small">Register as Resident, Guard, or Admin</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Full Name</label>
            <div className="input-group">
              <span className="input-group-text"><User size={18} /></span>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text"><Mail size={18} /></span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Password</label>
            <div className="input-group">
              <span className="input-group-text"><KeyRound size={18} /></span>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Role</label>
            <div className="input-group">
              <span className="input-group-text"><Shield size={18} /></span>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Resident">Resident</option>
                <option value="Security Guard">Security Guard</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {formData.role === 'Resident' && (
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Select Apartment/Flat</label>
              <div className="input-group">
                <span className="input-group-text"><Building size={18} /></span>
                <select
                  name="apartmentId"
                  className="form-select"
                  value={formData.apartmentId}
                  onChange={handleChange}
                >
                  <option value="">-- Choose Flat --</option>
                  {apartments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      Flat {apt.flatNumber} (Floor {apt.floor})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-success w-100 fw-bold py-2"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted small mb-0">
            Already have an account? <Link to="/login" className="fw-bold text-success">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
