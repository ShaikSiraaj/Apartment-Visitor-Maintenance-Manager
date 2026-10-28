import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <Building2 size={24} />
          <span>Apartment Manager</span>
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          {user ? (
            <>
              <span className="navbar-text text-white d-flex align-items-center gap-1">
                <UserIcon size={18} />
                <strong>{user.name}</strong> ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-light btn-sm text-primary fw-bold">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
