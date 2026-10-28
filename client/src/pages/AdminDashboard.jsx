import React, { useState, useEffect } from 'react';
import { userAPI, apartmentAPI, visitorAPI, maintenanceAPI, alertAPI } from '../services/api';
import { Users, Building, AlertCircle, Clock, Bell, CheckCircle2, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    residentsCount: 0,
    todayVisitorsCount: 0,
    pendingMaintenanceCount: 0,
    activeAlertsCount: 0,
  });
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newFlat, setNewFlat] = useState({ flatNumber: '', floor: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, aptsRes, visitorsRes, maintRes, alertsRes] = await Promise.all([
        userAPI.getAll(),
        apartmentAPI.getAll(),
        visitorAPI.getAll(),
        maintenanceAPI.getAll(),
        alertAPI.getAll(),
      ]);

      const residents = usersRes.data.filter((u) => u.role === 'Resident');
      const pending = maintRes.data.filter((m) => m.status === 'Pending');

      const todayStr = new Date().toISOString().split('T')[0];
      const todayVis = visitorsRes.data.filter((v) => {
        const vDate = new Date(v.entryTime).toISOString().split('T')[0];
        return vDate === todayStr;
      });

      const activeAlerts = alertsRes.data.filter((a) => a.status === 'Active');

      setStats({
        residentsCount: residents.length,
        todayVisitorsCount: todayVis.length,
        pendingMaintenanceCount: pending.length,
        activeAlertsCount: activeAlerts.length,
      });

      setUsers(usersRes.data);
      setApartments(aptsRes.data);
      setMaintenance(maintRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApartment = async (e) => {
    e.preventDefault();
    if (!newFlat.flatNumber) return;
    try {
      await apartmentAPI.create(newFlat);
      setNewFlat({ flatNumber: '', floor: 1 });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating apartment');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await maintenanceAPI.update(id, { status });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await alertAPI.resolve(id);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold mb-0">Admin Dashboard</h2>
        {stats.activeAlertsCount > 0 && (
          <span className="badge bg-danger p-2 fs-6 d-flex align-items-center gap-1 animate-pulse">
            <Bell size={18} /> {stats.activeAlertsCount} Urgent Visitor/Resident Complaints Raised!
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-primary text-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-white-50 text-uppercase mb-1 small fw-bold">Total Residents</h6>
                <h2 className="mb-0 fw-bold">{stats.residentsCount}</h2>
              </div>
              <Users size={32} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-success text-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-white-50 text-uppercase mb-1 small fw-bold">Today's Visitors</h6>
                <h2 className="mb-0 fw-bold">{stats.todayVisitorsCount}</h2>
              </div>
              <Clock size={32} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-warning text-dark p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-dark-50 text-uppercase mb-1 small fw-bold">Pending Maintenance</h6>
                <h2 className="mb-0 fw-bold">{stats.pendingMaintenanceCount}</h2>
              </div>
              <AlertCircle size={32} />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-danger text-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-white-50 text-uppercase mb-1 small fw-bold">Active Admin Alerts</h6>
                <h2 className="mb-0 fw-bold">{stats.activeAlertsCount}</h2>
              </div>
              <ShieldAlert size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Alerts Panel */}
      <div className="card shadow-sm border-danger border-2 mb-4 p-3 bg-light">
        <h5 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
          <Bell size={22} /> Live Visitor & Resident Urgent Complaints Alert Center
        </h5>
        <div className="table-responsive" style={{ maxHeight: '250px' }}>
          <table className="table table-hover align-middle mb-0">
            <thead className="table-danger">
              <tr>
                <th>Alert Title</th>
                <th>Description</th>
                <th>Raised By</th>
                <th>Role</th>
                <th>Urgency</th>
                <th>Raised At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a._id} className={a.status === 'Active' ? 'table-warning fw-bold' : ''}>
                  <td>{a.title}</td>
                  <td>{a.description}</td>
                  <td>{a.raisedBy}</td>
                  <td><span className="badge bg-secondary">{a.role}</span></td>
                  <td>
                    <span className={`badge ${a.urgency === 'Urgent' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {a.urgency}
                    </span>
                  </td>
                  <td className="small">{new Date(a.createdAt).toLocaleString()}</td>
                  <td>
                    {a.status === 'Active' ? (
                      <button
                        onClick={() => handleResolveAlert(a._id)}
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Resolve Alert
                      </button>
                    ) : (
                      <span className="badge bg-success">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">No alerts or complaints raised.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apartment & User Management Section */}
      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Building size={20} /> Add Apartment / Flat
            </h5>
            <form onSubmit={handleCreateApartment}>
              <div className="mb-2">
                <label className="form-label small fw-bold text-muted">Flat Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. A-101"
                  value={newFlat.flatNumber}
                  onChange={(e) => setNewFlat({ ...newFlat, flatNumber: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Floor Number</label>
                <input
                  type="number"
                  className="form-control"
                  value={newFlat.floor}
                  onChange={(e) => setNewFlat({ ...newFlat, floor: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Add Flat</button>
            </form>

            <hr />
            <h6 className="fw-bold text-muted mb-2">Registered Flats ({apartments.length})</h6>
            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '200px' }}>
              {apartments.map((apt) => (
                <div key={apt._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <strong>Flat {apt.flatNumber}</strong> <span className="text-muted small">(Floor {apt.floor})</span>
                  </div>
                  <span className="badge bg-secondary">{apt.residentIds?.length || 0} residents</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3">User Directory ({users.length})</h5>
            <div className="table-responsive" style={{ maxHeight: '350px' }}>
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Apartment</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-bold">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'Admin' ? 'bg-danger' : u.role === 'Security Guard' ? 'bg-info' : 'bg-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.apartmentId?.flatNumber || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Management Table */}
      <div className="card shadow-sm border-0 p-3">
        <h5 className="fw-bold mb-3">Recent Maintenance Requests</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Resident</th>
                <th>Apartment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((m) => (
                <tr key={m._id}>
                  <td>
                    <strong>{m.title}</strong>
                    <div className="text-muted small">{m.description}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{m.category}</span></td>
                  <td>{m.residentId?.name || 'Unknown'}</td>
                  <td>Flat {m.apartmentId?.flatNumber || 'N/A'}</td>
                  <td>
                    <span className={`badge ${m.status === 'Resolved' ? 'bg-success' : m.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'In Progress')}
                        className="btn btn-outline-primary"
                        disabled={m.status === 'In Progress'}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'Resolved')}
                        className="btn btn-outline-success"
                        disabled={m.status === 'Resolved'}
                      >
                        Resolve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">No maintenance requests submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
