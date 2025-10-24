import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Dropdown } from 'react-bootstrap';

const Navbar = ({ onToggleSidebar }) => {
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button 
            className="sidebar-toggle d-md-none" 
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <span className="navbar-brand mb-0 h1 d-flex align-items-center">
            <img 
              src="/logo-aluen.svg" 
              alt="ALUEN Logo" 
              style={{ 
                height: '40px', 
                width: '40px', 
                marginRight: '10px',
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))'
              }} 
              className="d-none d-sm-block"
            />
            <span style={{ letterSpacing: '2px', fontSize: 'inherit' }}>ALUEN</span>
          </span>
        </div>
        <div className="navbar-nav ms-auto d-flex align-items-center">
          {usuario && (
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-usuario" className="d-flex align-items-center">
                <span className="me-2">👤</span>
                <span>{usuario.nombre}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item disabled>
                  <small className="text-muted">{usuario.email}</small>
                </Dropdown.Item>
                <Dropdown.Item disabled>
                  <small className="text-muted">
                    Rol: {usuario.rol === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                  </small>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  🚪 Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

