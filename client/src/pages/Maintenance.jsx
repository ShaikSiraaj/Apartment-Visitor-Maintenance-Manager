import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { maintenanceAPI } from '../services/api';
import { Wrench, Filter, Trash2 } from 'lucide-react';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const res = await maintenanceAPI.getAll();
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await maintenanceAPI.update(id, { status });
      fetchMaintenance();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance request?')) return;
    try {
      await maintenanceAPI.delete(id);
      fetchMaintenance();
    } catch (err) {
      alert('Error deleting request');
    }
  };

  const filtered = requests.filter((r) => {
    const categoryMatch = filterCategory === 'All' || r.category === filterCategory;
    const statusMatch = filterStatus === 'All' || r.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  if (loading) {
    return <div className="p-4 text-center">Loading Maintenance Records...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Maintenance Center</h2>
          <p className="text-muted mb-0">Track and manage apartment service complaints</p>
        </div>

        {/* Filters */}
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Carpentry">Carpentry</option>
            <option value="General">General</option>
          </select>

          <select
            className="form-select form-select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm border-0 p-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Title & Description</th>
                <th>Category</th>
                <th>Resident</th>
                <th>Apartment</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.title}</strong>
                    <div className="text-muted small">{r.description}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{r.category}</span></td>
                  <td>{r.residentId?.name || 'Resident'}</td>
                  <td>Flat {r.apartmentId?.flatNumber || 'N/A'}</td>
                  <td className="small">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${r.status === 'Resolved' ? 'bg-success' : r.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {user?.role === 'Admin' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'In Progress')}
                            className="btn btn-outline-primary btn-sm"
                            disabled={r.status === 'In Progress'}
                          >
                            Progress
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'Resolved')}
                            className="btn btn-outline-success btn-sm"
                            disabled={r.status === 'Resolved'}
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {(user?.role === 'Admin' || user?._id === r.residentId?._id) && (
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="btn btn-outline-danger btn-sm"
                          title="Delete Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No maintenance records found matching filters.
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

export default Maintenance;
