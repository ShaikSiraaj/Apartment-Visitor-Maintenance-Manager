import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { visitorAPI } from '../services/api';
import { Users, Search, Trash2 } from 'lucide-react';

const Visitors = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await visitorAPI.getAll();
      setVisitors(res.data);
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visitor record?')) return;
    try {
      await visitorAPI.delete(id);
      fetchVisitors();
    } catch (err) {
      alert('Error deleting record');
    }
  };

  const filtered = visitors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.phone.includes(search) ||
    v.purpose.toLowerCase().includes(search.toLowerCase()) ||
    v.apartmentId?.flatNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-4 text-center">Loading Visitor Records...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1">Visitor History & Records</h2>
          <p className="text-muted mb-0">View all registered gate visitors and history</p>
        </div>
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text"><Search size={18} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search name, phone, flat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 p-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Visitor Name</th>
                <th>Phone Number</th>
                <th>Purpose</th>
                <th>Apartment / Flat</th>
                <th>Entry Timestamp</th>
                <th>Exit Timestamp</th>
                <th>Status</th>
                {user?.role === 'Admin' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id}>
                  <td className="fw-bold">{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.purpose}</td>
                  <td>Flat {v.apartmentId?.flatNumber || 'N/A'}</td>
                  <td className="small">{new Date(v.entryTime).toLocaleString()}</td>
                  <td className="small">
                    {v.exitTime ? new Date(v.exitTime).toLocaleString() : 'Still Inside'}
                  </td>
                  <td>
                    <span className={`badge ${v.status === 'Inside' ? 'bg-success' : 'bg-secondary'}`}>
                      {v.status}
                    </span>
                  </td>
                  {user?.role === 'Admin' && (
                    <td>
                      <button
                        onClick={() => handleDelete(v._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? '8' : '7'} className="text-center text-muted py-4">
                    No visitor records found matching query.
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

export default Visitors;
