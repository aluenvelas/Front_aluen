import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { usuario } = useAuth();

  // Definir todos los elementos del menú con sus roles permitidos
  const allMenuItems = [
    { path: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'usuario'] },
    { path: '/inventario', icon: '📦', label: 'Inventario', roles: ['admin', 'usuario'] },
    { path: '/ventas', icon: '💰', label: 'Ventas', roles: ['admin', 'usuario'] },
    { path: '/materiales', icon: '🧪', label: 'Materiales', roles: ['admin'] },
    { path: '/recetas', icon: '📝', label: 'Recetas', roles: ['admin'] },
    { path: '/frascos', icon: '🫙', label: 'Frascos', roles: ['admin'] },
    { path: '/nombres-velas', icon: '🕯️', label: 'Nombres de Velas', roles: ['admin'] },
    { path: '/activos', icon: '🏭', label: 'Activos', roles: ['admin'] },
    { path: '/reportes', icon: '📈', label: 'Reportes', roles: ['admin'] },
    { path: '/usuarios', icon: '👥', label: 'Usuarios', roles: ['admin'] }
  ];

  // Filtrar elementos del menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(usuario?.rol)
  );

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil al hacer click en un link
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div className={`sidebar col-md-3 col-lg-2 d-md-block ${isOpen ? 'show' : ''}`}>
      <div className="position-sticky pt-3">
        <div className="text-center mb-4 pb-3" style={{ borderBottom: '2px solid var(--aluen-gold)' }}>
          <img 
            src="/logo-aluen.svg" 
            alt="ALUEN Logo" 
            style={{ 
              height: '80px', 
              width: '80px', 
              marginBottom: '10px',
              filter: 'drop-shadow(0 4px 8px rgba(212, 175, 55, 0.4))'
            }} 
          />
          <h5 style={{ 
            color: 'var(--aluen-gold-light)', 
            letterSpacing: '3px',
            fontWeight: '700',
            marginBottom: '5px'
          }}>
            ALUEN
          </h5>
          <small style={{ color: 'var(--aluen-text-dark)', fontSize: '0.8rem' }}>
            Velas Artesanales
          </small>
        </div>
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={handleLinkClick}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

