import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://back-aluen-ohbk.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Si el error es 401 (no autorizado), redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Materiales
export const materialesAPI = {
  getAll: (params = {}) => api.get('/materiales', { params }),
  getById: (id) => api.get(`/materiales/${id}`),
  create: (data) => api.post('/materiales', data),
  update: (id, data) => api.put(`/materiales/${id}`, data),
  delete: (id) => api.delete(`/materiales/${id}`),
};

// Recetas
export const recetasAPI = {
  getAll: (params = {}) => api.get('/recetas', { params }),
  getById: (id) => api.get(`/recetas/${id}`),
  create: (data) => api.post('/recetas', data),
  update: (id, data) => api.put(`/recetas/${id}`, data),
  delete: (id) => api.delete(`/recetas/${id}`),
  getGramajes: (id) => api.get(`/recetas/${id}/gramajes`),
  toggleVisibilidad: (id) => api.patch(`/recetas/${id}/toggle-visibilidad`),
};

// Frascos
export const frascosAPI = {
  getAll: (params = {}) => api.get('/frascos', { params }),
  getById: (id) => api.get(`/frascos/${id}`),
  create: (data) => api.post('/frascos', data),
  update: (id, data) => api.put(`/frascos/${id}`, data),
  delete: (id) => api.delete(`/frascos/${id}`),
};

// Activos
export const activosAPI = {
  getAll: (params = {}) => api.get('/activos', { params }),
  getById: (id) => api.get(`/activos/${id}`),
  create: (data) => api.post('/activos', data),
  update: (id, data) => api.put(`/activos/${id}`, data),
  delete: (id) => api.delete(`/activos/${id}`),
};

// Ventas
export const ventasAPI = {
  getAll: (params = {}) => api.get('/ventas', { params }),
  getById: (id) => api.get(`/ventas/${id}`),
  create: (data) => api.post('/ventas', data),
  update: (id, data) => api.put(`/ventas/${id}`, data),
  delete: (id) => api.delete(`/ventas/${id}`),
  getEstadisticas: (params = {}) => api.get('/ventas/estadisticas', { params }),
  cambiarEstado: (id, estado) => api.patch(`/ventas/${id}/estado`, { estado }),
};

// Reportes
export const reportesAPI = {
  getDashboard: () => api.get('/reportes/dashboard'),
  getCostos: () => api.get('/reportes/costos'),
  getGramajes: (params = {}) => api.get('/reportes/gramajes', { params }),
  getInventario: () => api.get('/reportes/inventario'),
  descargarPDFVentas: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return `/api/reportes-pdf/ventas${queryString ? '?' + queryString : ''}`;
  },
};

// Nombres de Velas
export const nombresVelasAPI = {
  getAll: (params = {}) => api.get('/nombres-velas', { params }),
  getById: (id) => api.get(`/nombres-velas/${id}`),
  create: (data) => api.post('/nombres-velas', data),
  update: (id, data) => api.put(`/nombres-velas/${id}`, data),
  delete: (id) => api.delete(`/nombres-velas/${id}`),
};

// Usuarios
export const usuariosAPI = {
  getAll: (params = {}) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  cambiarPassword: (id, data) => api.put(`/usuarios/${id}/cambiar-password`, data),
  resetearPassword: (id, data) => api.put(`/usuarios/${id}/resetear-password`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// Inventario
export const inventarioAPI = {
  getAll: (params = {}) => api.get('/inventario', { params }),
  getById: (id) => api.get(`/inventario/${id}`),
  update: (id, data) => api.put(`/inventario/${id}`, data),
  getBajoStock: () => api.get('/inventario/alerta/bajo-stock'),
};

export default api;

