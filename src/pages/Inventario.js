import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { inventarioAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';

const Inventario = () => {
  const { usuario } = useAuth();
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStockMinimo, setEditingStockMinimo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventarioAPI.getAll({ activo: true });
      setInventario(response.data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.response?.data?.error || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStockMinimo = async (id, nuevoStockMinimo) => {
    try {
      await inventarioAPI.update(id, { stockMinimo: nuevoStockMinimo });
      setEditingStockMinimo(null);
      fetchInventario();
    } catch (err) {
      console.error('Error al actualizar stock mínimo:', err);
      alert('Error al actualizar el stock mínimo');
    }
  };

  const getImageUrl = (item) => {
    if (!item.receta) return null;
    
    const API_URL = process.env.REACT_APP_API_URL || 'https://back-aluen-ohbk.onrender.com/api';
    const baseURL = API_URL.replace('/api', '');
    
    // Priorizar imagen de la receta
    if (item.receta.imagenUrl) {
      const url = item.receta.imagenUrl;
      
      // Detectar enlaces de Google Drive
      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        const googleUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        return `${baseURL}/api/proxy-image?url=${encodeURIComponent(googleUrl)}`;
      }
      
      return url;
    }
    
    // Fallback a imagen del frasco
    if (!item.receta.frasco?.imagenUrl) return null;
    
    const url = item.receta.frasco.imagenUrl;
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      const googleUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      return `${baseURL}/api/proxy-image?url=${encodeURIComponent(googleUrl)}`;
    }
    
    return url;
  };

  const getEstadoStock = (item) => {
    if (item.stockActual === 0) {
      return { variant: 'danger', text: 'Sin Stock' };
    }
    if (item.stockActual <= item.stockMinimo) {
      return { variant: 'warning', text: 'Stock Bajo' };
    }
    return { variant: 'success', text: 'Stock Normal' };
  };

  const calcularValorInventario = (item) => {
    if (!item.receta?.precioVentaSugerido || !item.stockActual) return 0;
    return item.receta.precioVentaSugerido * item.stockActual;
  };

  // Función para filtrar inventario según el término de búsqueda
  const filterInventario = (inventario, searchTerm) => {
    if (!searchTerm.trim()) return inventario;
    
    const term = searchTerm.toLowerCase();
    
    return inventario.filter(item => {
      // Buscar por código de receta
      if (item.receta?.codigo && item.receta.codigo.toLowerCase().includes(term)) return true;
      
      // Buscar por nombre de vela
      if (item.nombreVela && item.nombreVela.toLowerCase().includes(term)) return true;
      
      // Buscar por nombre de receta
      if (item.receta?.nombre && item.receta.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por frasco
      if (item.receta?.frasco?.nombre && item.receta.frasco.nombre.toLowerCase().includes(term)) return true;
      
      // Buscar por precio
      if (item.receta?.precioVentaSugerido && item.receta.precioVentaSugerido.toString().includes(term)) return true;
      
      return false;
    });
  };

  const inventarioFiltrado = filterInventario(inventario, searchTerm);

  const totalUnidades = inventarioFiltrado.reduce((sum, item) => sum + item.stockActual, 0);
  const totalValor = inventarioFiltrado.reduce((sum, item) => sum + calcularValorInventario(item), 0);
  const bajoStock = inventarioFiltrado.filter(item => item.stockActual <= item.stockMinimo).length;

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-3" style={{ color: 'var(--aluen-gold)', fontWeight: 'bold' }}>
            📦 Inventario de Velas
          </h2>
        </Col>
      </Row>

      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por código, nombre, frasco, precio..."
      />

      {/* Tarjetas de Resumen */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Total Unidades</h6>
              <h3 className="mb-0" style={{ color: 'var(--aluen-gold)' }}>{totalUnidades}</h3>
              <small className="text-muted">{inventarioFiltrado.length} productos {searchTerm ? 'encontrados' : 'diferentes'}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Valor Inventario</h6>
              <h3 className="mb-0" style={{ color: 'var(--aluen-gold)' }}>
                ${totalValor.toLocaleString('es-AR')}
              </h3>
              <small className="text-muted">Precio de venta sugerido</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Alertas de Stock</h6>
              <h3 className="mb-0" style={{ color: bajoStock > 0 ? '#dc3545' : '#28a745' }}>
                {bajoStock}
              </h3>
              <small className="text-muted">Productos con stock bajo</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerta de stock bajo */}
      {bajoStock > 0 && (
        <Alert variant="warning" className="mb-4">
          <strong>⚠️ Atención:</strong> Hay {bajoStock} producto{bajoStock > 1 ? 's' : ''} con stock bajo o agotado.
        </Alert>
      )}

      {/* Tabla de Inventario */}
      <Card className="shadow-sm">
        <Card.Body>
          {inventario.length === 0 ? (
            <Alert variant="info" className="text-center mb-0">
              No hay productos en el inventario. Crea recetas para comenzar.
            </Alert>
          ) : inventarioFiltrado.length === 0 ? (
            <Alert variant="info" className="text-center mb-0">
              No se encontraron productos que coincidan con "<strong>{searchTerm}</strong>"
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead style={{ backgroundColor: 'var(--aluen-dark)', color: 'white' }}>
                  <tr>
                    <th style={{ width: '80px' }}>Imagen</th>
                    <th>Código</th>
                    <th>Nombre de Vela</th>
                    <th className="text-center">Stock Actual</th>
                    <th className="text-center">Stock Mínimo</th>
                    <th className="text-center">Estado</th>
                    {usuario?.rol === 'admin' && (
                      <>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Valor Total</th>
                      </>
                    )}
                    <th>Última Producción</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.map((item) => {
                    const imageUrl = getImageUrl(item);
                    const estado = getEstadoStock(item);
                    
                    return (
                      <tr key={item._id}>
                        <td>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.nombreVela}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid var(--aluen-gold-light)'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                              }}
                            >
                              🕯️
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge bg="secondary">{item.receta?.codigo || 'N/A'}</Badge>
                        </td>
                        <td>
                          <strong>{item.nombreVela}</strong>
                          {item.receta?.nombre && item.receta.nombre !== item.nombreVela && (
                            <div>
                              <small className="text-muted">{item.receta.nombre}</small>
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <h5 className="mb-0">
                            <Badge bg={item.stockActual === 0 ? 'danger' : 'primary'}>
                              {item.stockActual}
                            </Badge>
                          </h5>
                        </td>
                        <td className="text-center">
                          {usuario?.rol === 'admin' && editingStockMinimo === item._id ? (
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <Form.Control
                                type="number"
                                size="sm"
                                min="0"
                                defaultValue={item.stockMinimo}
                                style={{ width: '70px' }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateStockMinimo(item._id, parseInt(e.target.value));
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="success"
                                onClick={(e) => {
                                  const input = e.target.parentElement.querySelector('input');
                                  handleUpdateStockMinimo(item._id, parseInt(input.value));
                                }}
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingStockMinimo(null)}
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div
                              onClick={() => usuario?.rol === 'admin' && setEditingStockMinimo(item._id)}
                              style={{ cursor: usuario?.rol === 'admin' ? 'pointer' : 'default' }}
                            >
                              {item.stockMinimo}
                              {usuario?.rol === 'admin' && (
                                <small className="text-muted d-block">✏️</small>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <Badge bg={estado.variant}>{estado.text}</Badge>
                        </td>
                        {usuario?.rol === 'admin' && (
                          <>
                            <td className="text-end">
                              ${(item.receta?.precioVentaSugerido || 0).toLocaleString('es-AR')}
                            </td>
                            <td className="text-end">
                              <strong>
                                ${calcularValorInventario(item).toLocaleString('es-AR')}
                              </strong>
                            </td>
                          </>
                        )}
                        <td>
                          {item.ultimaProduccion?.fecha ? (
                            <>
                              <div>{new Date(item.ultimaProduccion.fecha).toLocaleDateString('es-AR')}</div>
                              <small className="text-muted">({item.ultimaProduccion.cantidad} unidades)</small>
                            </>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Inventario;

