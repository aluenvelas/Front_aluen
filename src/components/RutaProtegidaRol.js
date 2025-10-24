import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RutaProtegidaRol = ({ children, rolesPermitidos = [] }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  // Si no se especifican roles, permitir acceso a todos los autenticados
  if (rolesPermitidos.length === 0) {
    return children;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (!rolesPermitidos.includes(usuario.rol)) {
    // Redirigir al dashboard si no tiene permiso
    return <Navigate to="/" />;
  }

  return children;
};

export default RutaProtegidaRol;


