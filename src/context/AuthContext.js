import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Verificar si hay un token guardado
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
      // Configurar axios para incluir el token en todas las peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: nuevoToken, ...userData } = response.data;

      setToken(nuevoToken);
      setUsuario(userData);

      // Guardar en localStorage
      localStorage.setItem('token', nuevoToken);
      localStorage.setItem('usuario', JSON.stringify(userData));

      // Configurar axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${nuevoToken}`;

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  const registro = async (nombre, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/registro`, { nombre, email, password });
      const { token: nuevoToken, ...userData } = response.data;

      setToken(nuevoToken);
      setUsuario(userData);

      // Guardar en localStorage
      localStorage.setItem('token', nuevoToken);
      localStorage.setItem('usuario', JSON.stringify(userData));

      // Configurar axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${nuevoToken}`;

      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrar usuario'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete axios.defaults.headers.common['Authorization'];
  };

  const actualizarPerfil = async (nombre, email) => {
    try {
      const response = await axios.put(`${API_URL}/auth/perfil`, { nombre, email });
      const userData = response.data;

      setUsuario(userData);
      localStorage.setItem('usuario', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar perfil'
      };
    }
  };

  const cambiarPassword = async (passwordActual, passwordNueva) => {
    try {
      await axios.put(`${API_URL}/auth/cambiar-password`, { passwordActual, passwordNueva });
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar contraseña'
      };
    }
  };

  const value = {
    usuario,
    token,
    loading,
    login,
    registro,
    logout,
    actualizarPerfil,
    cambiarPassword,
    estaAutenticado: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
