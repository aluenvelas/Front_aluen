import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import RutaProtegidaRol from './components/RutaProtegidaRol';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materiales from './pages/Materiales';
import Recetas from './pages/Recetas';
import Frascos from './pages/Frascos';
import Activos from './pages/Activos';
import Ventas from './pages/Ventas';
import Reportes from './pages/Reportes';
import NombresVelas from './pages/NombresVelas';
import Usuarios from './pages/Usuarios';
import Inventario from './pages/Inventario';

// Componente para redirigir si ya está autenticado
const RedirectIfAuthenticated = ({ children }) => {
  const { estaAutenticado } = useAuth();
  return estaAutenticado ? <Navigate to="/" /> : children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route 
        path="/login" 
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        } 
      />

      {/* Rutas protegidas */}
      <Route 
        path="/*" 
        element={
          <RutaProtegida>
            <div className="d-flex">
              {/* Overlay para móvil */}
              <div 
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={closeSidebar}
              ></div>
              
              <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
              
              <div className="flex-grow-1">
                <Navbar onToggleSidebar={toggleSidebar} />
                <main className="main-content">
                  <Routes>
                    {/* Rutas accesibles para todos los usuarios autenticados */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/ventas" element={<Ventas />} />
                    
                    {/* Rutas solo para administradores */}
                    <Route 
                      path="/materiales" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <Materiales />
                        </RutaProtegidaRol>
                      } 
                    />
                    <Route 
                      path="/recetas" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <Recetas />
                        </RutaProtegidaRol>
                      } 
                    />
                    <Route 
                      path="/frascos" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <Frascos />
                        </RutaProtegidaRol>
                      } 
                    />
                    <Route 
                      path="/nombres-velas" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <NombresVelas />
                        </RutaProtegidaRol>
                      } 
                    />
                    <Route 
                      path="/activos" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <Activos />
                        </RutaProtegidaRol>
                      } 
                    />
                    <Route 
                      path="/reportes" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <Reportes />
                        </RutaProtegidaRol>
                      } 
                    />
                    <Route 
                      path="/usuarios" 
                      element={
                        <RutaProtegidaRol rolesPermitidos={['admin']}>
                          <Usuarios />
                        </RutaProtegidaRol>
                      } 
                    />
                  </Routes>
                </main>
              </div>
            </div>
          </RutaProtegida>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

