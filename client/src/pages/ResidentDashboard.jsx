import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { visitorAPI, maintenanceAPI, alertAPI } from '../services/api';
import { Home, Users, Wrench, Plus, BellRing, AlertTriangle } from 'lucide-react';

const ResidentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'General',
  });
  const [urgentAlert, setUrgentAlert] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidentData();
  }, []);

  const fetchResidentData = async () => {
    try {
      const [visRes, maintRes] = await Promise.all([
        visitorAPI.getAll(),
        maintenanceAPI.getAll(),
      ]);
      setVisitors(visRes.data);
      setMaintenanceRequests(maintRes.data);
    } catch (err) {
      console.error('Error loading resident dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;

    try {
      await maintenanceAPI.create(newComplaint);
      setNewComplaint({ title: '', description: '', category: 'General' });
      fetchResidentData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting complaint');
    }
  };

  const handleRaiseUrgentAlert = async (e) => {
    e.preventDefault();
    if (!urgentAlert.title || !urgentAlert.description) return;

    try {
      await alertAPI.create({
        title: urgentAlert.title,
        description: urgentAlert.description,
        raisedBy: `${user?.name} (Flat ${user?.apartmentId?.flatNumber || 'Assigned'})`,
        role: 'Resident',
        apartmentId: user?.apartmentId?._id || user?.apartmentId,
        urgency: 'Urgent',
      });
      setUrgentAlert({ title: '', description: '' });
      alert('Urgent alert sent directly to Admin!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error raising alert');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading Resident Dashboard...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Resident Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, <strong>{user?.name}</strong> | Apartment:{' '}
            <span className="badge bg-primary">Flat {user?.apartmentId?.flatNumber || 'Assigned'}</span>
          </p>
        </div>
      </div>

      {/* Urgent Admin Complaint Alert Banner */}
      <div className="card shadow-sm border-danger border-2 mb-4 p-3 bg-light">
        <h5 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
          <BellRing size={20} /> Urgent Complaint Alert to Admin
        </h5>
        <p className="text-muted small mb-3">
          Need immediate admin intervention? Submit an urgent alert directly to the Admin Dashboard.
        </p>
        <form onSubmit={handleRaiseUrgentAlert} className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Alert Title / Issue Summary"
              value={urgentAlert.title}
              onChange={(e) => setUrgentAlert({ ...urgentAlert, title: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Detailed emergency description..."
              value={urgentAlert.description}
              onChange={(e) => setUrgentAlert({ ...urgentAlert, description: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-1">
              <AlertTriangle size={16} /> Send Alert
            </button>
          </div>
        </form>
      </div>

      <div className="row g-4 mb-4">
        {/* Submit Complaint Card */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Plus size={20} /> Raise Maintenance Request
            </h5>
            <form onSubmit={handleCreateComplaint}>
              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Category</label>
                <select
                  className="form-select"
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Carpentry">Carpentry</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Title / Issue Summary</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Broken Light Switch"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Detailed Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe the issue in detail..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold">
                Submit Complaint
              </button>
            </form>
          </div>
        </div>

        {/* Maintenance Requests Status Table */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Wrench size={20} /> My Maintenance Complaints
            </h5>
            <div className="table-responsive" style={{ maxHeight: '360px' }}>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Issue</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <strong>{m.title}</strong>
                        <div className="text-muted small">{m.description}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{m.category}</span></td>
                      <td>
                        <span className={`badge ${m.status === 'Resolved' ? 'bg-success' : m.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {maintenanceRequests.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No active complaints registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Log for Apartment */}
      <div className="card shadow-sm border-0 p-3">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Users size={20} /> Visitor History For My Flat
        </h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Visitor Name</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id}>
                  <td className="fw-bold">{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.purpose}</td>
                  <td className="small">{new Date(v.entryTime).toLocaleString()}</td>
                  <td className="small">
                    {v.exitTime ? new Date(v.exitTime).toLocaleString() : '-'}
                  </td>
                  <td>
                    <span className={`badge ${v.status === 'Inside' ? 'bg-success' : 'bg-secondary'}`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    No visitors recorded for your apartment yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
