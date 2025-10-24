import React, { useState, useEffect } from 'react';
import { recetasAPI } from '../services/api';
import { Card, Row, Col, Badge, Container } from 'react-bootstrap';
import RecetaDetalleModal from '../components/RecetaDetalleModal';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { usuario } = useAuth();
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecetas();
  }, []);

  const fetchRecetas = async () => {
    try {
      setLoading(true);
      const response = await recetasAPI.getAll({ activo: 'true' });
      setRecetas(response.data);
    } catch (err) {
      setError('Error al cargar las recetas');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (receta) => {
    setSelectedReceta(receta);
    setShowDetalleModal(true);
  };

  const handleCloseModal = () => {
    setShowDetalleModal(false);
    setSelectedReceta(null);
  };

  // Función para obtener la URL de la imagen (prioriza imagen de receta sobre frasco)
  const getImageUrl = (receta) => {
    // Priorizar imagen de la receta si existe
    if (receta.imagenUrl) {
      const match = receta.imagenUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const fileId = match[1];
        const googleUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        const API_URL = process.env.REACT_APP_API_URL || 'https://back-aluen-ohbk.onrender.com/api';
        const baseURL = API_URL.replace('/api', '');
        return `${baseURL}/api/proxy-image?url=${encodeURIComponent(googleUrl)}`;
      }
      return receta.imagenUrl; // URL directa
    }

    // Fallback a imagen del frasco
    if (!receta.frasco?.imagenUrl) return null;
    
    const match = receta.frasco.imagenUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const fileId = match[1];
      const googleUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      const API_URL = process.env.REACT_APP_API_URL || 'https://back-aluen-ohbk.onrender.com/api';
      const baseURL = API_URL.replace('/api', '');
      return `${baseURL}/api/proxy-image?url=${encodeURIComponent(googleUrl)}`;
    }
    return null;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0';
    }
    return `$${Number(price).toFixed(0)}`;
  };

  // Función para filtrar recetas según el término de búsqueda
  const filterRecetas = (recetas, searchTerm) => {
    if (!searchTerm.trim()) return recetas;
    
    const term = searchTerm.toLowerCase();
    
    return recetas.filter(receta => {
      // Buscar por código
      if (receta.codigo && receta.codigo.toLowerCase().includes(term)) return true;
      
      // Buscar por nombre
      if (receta.nombre && receta.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por descripción
      if (receta.descripcion && receta.descripcion.toLowerCase().includes(term)) return true;
      
      // Buscar por frasco
      if (receta.frasco?.nombre && receta.frasco.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por tipo de cera
      if (receta.cera?.material?.nombre && receta.cera.material.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por esencia/fragancia
      if (receta.esencia?.material?.nombre && receta.esencia.material.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por precio (convertir a string)
      if (receta.precioVentaSugerido && receta.precioVentaSugerido.toString().includes(term)) return true;
      
      return false;
    });
  };

  const recetasFiltradas = filterRecetas(recetas, searchTerm);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-0">🕯️ Catálogo de Velas</h1>
          <p className="text-muted mb-0">Recetas disponibles para producción</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={fetchRecetas}
        >
          🔄 Actualizar
        </button>
      </div>

      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por código, nombre, frasco, cera, fragancia, precio..."
      />

      {recetas.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          No hay recetas creadas aún. Ve a la sección "Recetas" para crear una.
        </div>
      ) : recetasFiltradas.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No se encontraron recetas que coincidan con "<strong>{searchTerm}</strong>"
        </div>
      ) : (
        <Row>
          {recetasFiltradas.map((receta) => {
            const imageUrl = getImageUrl(receta);
            const costoTotal = (receta.costoPorUnidad || 0) + (receta.costosFijosTotales || 4750);
            
            return (
              <Col key={receta._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card 
                  className="h-100 shadow-sm" 
                  style={{ 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '2px solid transparent'
                  }}
                  onClick={() => handleCardClick(receta)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'var(--aluen-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {/* Imagen del Frasco */}
                  <div style={{ 
                    height: '250px',
                    backgroundColor: '#ffffff',
                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: '0.75rem',
                    borderTopRightRadius: '0.75rem',
                    position: 'relative',
                    padding: '10px'
                  }}>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={receta.nombre}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                        onError={(e) => {
                          if (e && e.target && e.target.src && !e.target.src.startsWith('data:')) {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f8f9fa" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3E🕯️%3C/text%3E%3C/svg%3E';
                          }
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '4rem', opacity: 0.3 }}>🕯️</div>
                    )}
                    
                    {/* Badge de Inventario */}
                    {receta.inventarioDescontado && (
                      <Badge 
                        bg="success" 
                        style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px',
                          fontSize: '0.7rem'
                        }}
                      >
                        ✓ Producida
                      </Badge>
                    )}
                  </div>

                  <Card.Body className="d-flex flex-column">
                    {/* Código de la Receta */}
                    {receta.codigo && (
                      <div className="mb-2">
                        <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                          {receta.codigo}
                        </Badge>
                      </div>
                    )}

                    {/* Nombre de la Vela */}
                    <Card.Title style={{ 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--aluen-gold-light)',
                      marginBottom: '0.5rem',
                      minHeight: '2.2rem'
                    }}>
                      {receta.nombre || 'Sin nombre'}
                    </Card.Title>

                    {/* Información visible solo para administradores */}
                    {usuario?.rol === 'admin' && (
                      <>
                        {/* Frasco */}
                        <div className="mb-2">
                          <small className="text-muted">Frasco:</small>
                          <div>
                            <Badge bg="info" className="me-1">
                              🫙 {receta.frasco?.nombre || 'N/A'}
                            </Badge>
                            {receta.frasco?.capacidad && (
                              <Badge bg="secondary">
                                {receta.frasco.capacidad}ml
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Composición */}
                        <div className="mb-2">
                          <small className="text-muted">Composición:</small>
                          <div className="d-flex flex-wrap gap-1">
                            <Badge bg="primary" style={{ fontSize: '0.65rem' }}>
                              Cera {receta.cera?.porcentaje || 0}%
                            </Badge>
                            <Badge bg="success" style={{ fontSize: '0.65rem' }}>
                              Esencia {receta.esencia?.porcentaje || 0}%
                            </Badge>
                            {receta.aditivo?.material && (
                              <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>
                                Aditivo {receta.aditivo?.porcentaje || 0}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Gramaje y Unidades */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Gramaje:</small>
                            <strong>{receta.gramajeTotal || 0}g</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Unidades:</small>
                            <strong>{receta.unidadesProducir || 0} uds</strong>
                          </div>
                        </div>

                        {/* Divider */}
                        <hr style={{ margin: '0.5rem 0', borderColor: 'var(--aluen-gold)', opacity: 0.3 }} />

                        {/* Costos */}
                        <div className="mb-2">
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Costo materiales:</small>
                            <small className="text-info">{formatPrice(receta.costoPorUnidad)}</small>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Costos fijos:</small>
                            <small className="text-warning">{formatPrice(receta.costosFijosTotales || 4750)}</small>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Costo total:</small>
                            <small><strong>{formatPrice(costoTotal)}</strong></small>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Información para usuarios normales - Solo descripción si existe */}
                    {usuario?.rol !== 'admin' && receta.descripcion && (
                      <div className="mb-3">
                        <small className="text-muted">Descripción:</small>
                        <p className="mb-0" style={{ fontSize: '0.9rem' }}>{receta.descripcion}</p>
                      </div>
                    )}

                    {/* Precio de Venta - DESTACADO - Visible para todos */}
                    <div 
                      className="mt-auto p-3 text-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--aluen-gold) 0%, var(--aluen-bronze) 100%)',
                        borderRadius: '0.5rem',
                        marginTop: usuario?.rol === 'admin' ? '1rem' : '2rem'
                      }}
                    >
                      <small style={{ 
                        color: 'var(--aluen-darker)', 
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        💵 PRECIO DE VENTA
                      </small>
                      <div style={{ 
                        color: 'var(--aluen-darker)', 
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        lineHeight: '1',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {formatPrice(receta.precioVentaSugerido)}
                      </div>
                      {usuario?.rol === 'admin' && (
                        <small style={{ 
                          color: 'var(--aluen-darker)', 
                          fontSize: '0.7rem',
                          opacity: 0.8
                        }}>
                          ({receta.porcentajeGanancia || 20}% ganancia)
                        </small>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal de Detalles */}
      {selectedReceta && (
        <RecetaDetalleModal
          show={showDetalleModal}
          onHide={handleCloseModal}
          receta={selectedReceta}
        />
      )}
    </Container>
  );
};

export default Dashboard;

