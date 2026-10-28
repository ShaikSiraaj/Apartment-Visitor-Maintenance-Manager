import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Wrench, ShieldAlert, Home } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="bg-light border-end vh-100 p-3" style={{ width: '250px' }}>
      <h6 className="text-muted text-uppercase fw-bold mb-3 small">Navigation</h6>
      <ul className="nav nav-pills flex-column mb-auto">
        {user.role === 'Admin' && (
          <li className="nav-item mb-1">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
              }
            >
              <LayoutDashboard size={18} /> Admin Dashboard
            </NavLink>
          </li>
        )}

        {user.role === 'Resident' && (
          <li className="nav-item mb-1">
            <NavLink
              to="/resident"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
              }
            >
              <Home size={18} /> Resident Dashboard
            </NavLink>
          </li>
        )}

        {user.role === 'Security Guard' && (
          <li className="nav-item mb-1">
            <NavLink
              to="/security"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
              }
            >
              <ShieldAlert size={18} /> Security Guard
            </NavLink>
          </li>
        )}

        <li className="nav-item mb-1">
          <NavLink
            to="/visitors"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
            }
          >
            <Users size={18} /> Visitor Log
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/maintenance"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
            }
          >
            <Wrench size={18} /> Maintenance
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
