import React, { useState, useEffect } from 'react';
import { visitorAPI, apartmentAPI, alertAPI } from '../services/api';
import { ShieldCheck, UserPlus, LogOut, Search, AlertTriangle, BellRing } from 'lucide-react';

const SecurityDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    apartmentId: '',
  });
  const [gateAlert, setGateAlert] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const [visRes, aptRes] = await Promise.all([
        visitorAPI.getAll(),
        apartmentAPI.getAll(),
      ]);
      setVisitors(visRes.data);
      setApartments(aptRes.data);
    } catch (err) {
      console.error('Failed to load security dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterVisitor = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.purpose || !formData.apartmentId) {
      alert('Please fill out all visitor fields');
      return;
    }

    try {
      await visitorAPI.create(formData);
      setFormData({ name: '', phone: '', purpose: '', apartmentId: '' });
      fetchSecurityData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering visitor');
    }
  };

  const handleRecordExit = async (id) => {
    try {
      await visitorAPI.recordExit(id);
      fetchSecurityData();
    } catch (err) {
      alert('Error recording visitor exit');
    }
  };

  const handleRaiseGateAlert = async (e) => {
    e.preventDefault();
    if (!gateAlert.title || !gateAlert.description) return;

    try {
      await alertAPI.create({
        title: gateAlert.title,
        description: gateAlert.description,
        raisedBy: 'Gate Security Guard',
        role: 'Security Guard',
        urgency: 'Urgent',
      });
      setGateAlert({ title: '', description: '' });
      alert('Security incident alert sent directly to Admin Dashboard!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending gate alert');
    }
  };

  const filteredVisitors = visitors.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm) ||
    v.apartmentId?.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeVisitorsCount = visitors.filter((v) => v.status === 'Inside').length;

  if (loading) {
    return <div className="p-4 text-center">Loading Security Guard Dashboard...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Security Guard Portal</h2>
          <p className="text-muted mb-0">Register visitor check-ins & check-outs at gate entry</p>
        </div>
        <div className="badge bg-danger p-2 fs-6">
          Currently Inside: <strong>{activeVisitorsCount}</strong> Visitors
        </div>
      </div>

      {/* Security Incident Gate Alert Form */}
      <div className="card shadow-sm border-warning border-2 mb-4 p-3 bg-light">
        <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
          <BellRing size={20} className="text-danger" /> Raise Security Incident Alert to Admin
        </h5>
        <form onSubmit={handleRaiseGateAlert} className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Incident Title (e.g. Unresponsive Visitor)"
              value={gateAlert.title}
              onChange={(e) => setGateAlert({ ...gateAlert, title: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Detailed description of gate emergency..."
              value={gateAlert.description}
              onChange={(e) => setGateAlert({ ...gateAlert, description: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-warning fw-bold text-dark w-100 d-flex align-items-center justify-content-center gap-1">
              <AlertTriangle size={16} /> Raise Alert
            </button>
          </div>
        </form>
      </div>

      <div className="row g-4 mb-4">
        {/* Register Visitor Form */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <UserPlus size={20} /> Register Visitor Entry
            </h5>
            <form onSubmit={handleRegisterVisitor}>
              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Visitor Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. 555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Purpose of Visit</label>
                <input
                  type="text"
                  name="purpose"
                  className="form-control"
                  placeholder="e.g. Delivery, Guest, Maintenance"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Visiting Apartment/Flat</label>
                <select
                  name="apartmentId"
                  className="form-select"
                  value={formData.apartmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Flat --</option>
                  {apartments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      Flat {apt.flatNumber} (Floor {apt.floor})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-success w-100 fw-bold">
                Check-In Visitor
              </button>
            </form>
          </div>
        </div>

        {/* Live Active Visitor Table */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0 p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Gate Visitor Log</h5>
              <div className="input-group style-search" style={{ maxWidth: '250px' }}>
                <span className="input-group-text"><Search size={16} /></span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search visitor or flat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive" style={{ maxHeight: '400px' }}>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Visitor</th>
                    <th>Phone</th>
                    <th>Flat</th>
                    <th>Purpose</th>
                    <th>Entry Time</th>
                    <th>Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((v) => (
                    <tr key={v._id}>
                      <td className="fw-bold">{v.name}</td>
                      <td>{v.phone}</td>
                      <td>Flat {v.apartmentId?.flatNumber || 'N/A'}</td>
                      <td>{v.purpose}</td>
                      <td className="small">{new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        {v.status === 'Inside' ? (
                          <button
                            onClick={() => handleRecordExit(v._id)}
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                          >
                            <LogOut size={14} /> Check Out
                          </button>
                        ) : (
                          <span className="badge bg-secondary">
                            Exited at {new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-3">No matching visitor records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
