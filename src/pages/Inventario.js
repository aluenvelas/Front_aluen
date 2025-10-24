import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner, Button, Form, Modal } from 'react-bootstrap';
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
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [itemAjuste, setItemAjuste] = useState(null);
  const [ajusteData, setAjusteData] = useState({
    tipo: 'absoluto', // 'absoluto' o 'relativo'
    valor: 0,
    motivo: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);

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

  const handleOpenAjusteModal = (item) => {
    setItemAjuste(item);
    setAjusteData({
      tipo: 'absoluto',
      valor: item.stockActual,
      motivo: ''
    });
    setShowAjusteModal(true);
  };

  const handleCloseAjusteModal = () => {
    setShowAjusteModal(false);
    setItemAjuste(null);
    setAjusteData({
      tipo: 'absoluto',
      valor: 0,
      motivo: ''
    });
  };

  const handleAjustarStock = async () => {
    if (!itemAjuste) return;

    try {
      const payload = {
        motivo: ajusteData.motivo || 'Ajuste manual de inventario'
      };

      if (ajusteData.tipo === 'absoluto') {
        payload.stockActual = parseInt(ajusteData.valor);
      } else {
        payload.ajuste = parseInt(ajusteData.valor);
      }

      const response = await inventarioAPI.update(itemAjuste._id, payload);
      
      alert(`✅ Stock actualizado exitosamente\n\nStock anterior: ${response.data.cambio.stockAnterior}\nStock nuevo: ${response.data.cambio.stockNuevo}\nDiferencia: ${response.data.cambio.diferencia >= 0 ? '+' : ''}${response.data.cambio.diferencia}`);
      
      handleCloseAjusteModal();
      fetchInventario();
    } catch (err) {
      console.error('Error al ajustar stock:', err);
      alert('❌ Error al ajustar el stock: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenDeleteModal = (item) => {
    if (item.stockActual > 0) {
      alert('⚠️ No se puede eliminar un producto con stock disponible.\n\nPrimero ajusta el stock a 0.');
      return;
    }
    setItemAEliminar(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemAEliminar) return;

    try {
      const response = await inventarioAPI.delete(itemAEliminar._id);
      alert(`✅ ${response.data.mensaje}\n\nProducto: ${response.data.nombreVela}\nCódigo: ${response.data.codigo}`);
      setShowDeleteModal(false);
      setItemAEliminar(null);
      fetchInventario();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setItemAEliminar(null);
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
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <h5 className="mb-0">
                              <Badge bg={item.stockActual === 0 ? 'danger' : 'primary'}>
                                {item.stockActual}
                              </Badge>
                            </h5>
                            {usuario?.rol === 'admin' && (
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() => handleOpenAjusteModal(item)}
                                title="Ajustar stock"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                              >
                                ✏️
                              </Button>
                            )}
                            {usuario?.rol === 'admin' && item.stockActual === 0 && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleOpenDeleteModal(item)}
                                title="Eliminar del inventario"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                              >
                                🗑️
                              </Button>
                            )}
                          </div>
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

      {/* Modal para Ajustar Stock */}
      <Modal show={showAjusteModal} onHide={handleCloseAjusteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            📦 Ajustar Stock - {itemAjuste?.nombreVela}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemAjuste && (
            <>
              <Alert variant="info" className="mb-3">
                <strong>Stock actual:</strong> {itemAjuste.stockActual} unidades
              </Alert>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Ajuste</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Establecer cantidad exacta"
                      name="tipoAjuste"
                      id="absoluto"
                      checked={ajusteData.tipo === 'absoluto'}
                      onChange={() => setAjusteData({
                        ...ajusteData,
                        tipo: 'absoluto',
                        valor: itemAjuste.stockActual
                      })}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Sumar o restar unidades"
                      name="tipoAjuste"
                      id="relativo"
                      checked={ajusteData.tipo === 'relativo'}
                      onChange={() => setAjusteData({
                        ...ajusteData,
                        tipo: 'relativo',
                        valor: 0
                      })}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    {ajusteData.tipo === 'absoluto' ? 'Nueva cantidad' : 'Cantidad a ajustar'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={ajusteData.valor}
                    onChange={(e) => setAjusteData({
                      ...ajusteData,
                      valor: e.target.value
                    })}
                    placeholder={ajusteData.tipo === 'absoluto' ? 'Ej: 10' : 'Ej: -5 (para restar) o +3 (para sumar)'}
                  />
                  {ajusteData.tipo === 'relativo' && (
                    <Form.Text className="text-muted">
                      Usa números negativos para restar (-5) y positivos para sumar (+3)
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Motivo del ajuste (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={ajusteData.motivo}
                    onChange={(e) => setAjusteData({
                      ...ajusteData,
                      motivo: e.target.value
                    })}
                    placeholder="Ej: Merma por daño, corrección de inventario, etc."
                  />
                </Form.Group>

                {ajusteData.tipo === 'absoluto' && (
                  <Alert variant={parseInt(ajusteData.valor) < itemAjuste.stockActual ? 'warning' : 'success'}>
                    <strong>Resultado:</strong> {parseInt(ajusteData.valor) || 0} unidades
                    <br />
                    <strong>Diferencia:</strong>{' '}
                    {(parseInt(ajusteData.valor) || 0) - itemAjuste.stockActual >= 0 ? '+' : ''}
                    {(parseInt(ajusteData.valor) || 0) - itemAjuste.stockActual} unidades
                  </Alert>
                )}

                {ajusteData.tipo === 'relativo' && (
                  <Alert variant={parseInt(ajusteData.valor) < 0 ? 'warning' : 'success'}>
                    <strong>Stock resultante:</strong>{' '}
                    {itemAjuste.stockActual + (parseInt(ajusteData.valor) || 0)} unidades
                    {itemAjuste.stockActual + (parseInt(ajusteData.valor) || 0) < 0 && (
                      <div className="text-danger mt-2">
                        ⚠️ El ajuste resultaría en stock negativo. No se puede aplicar.
                      </div>
                    )}
                  </Alert>
                )}
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAjusteModal}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAjustarStock}
            disabled={
              !ajusteData.valor ||
              (ajusteData.tipo === 'relativo' && itemAjuste && (itemAjuste.stockActual + parseInt(ajusteData.valor || 0) < 0))
            }
          >
            💾 Guardar Ajuste
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemAEliminar && (
            <>
              <Alert variant="warning">
                <strong>¿Estás seguro que deseas eliminar este producto del inventario?</strong>
              </Alert>
              <div className="mb-3">
                <p><strong>Código:</strong> {itemAEliminar.receta?.codigo || 'N/A'}</p>
                <p><strong>Nombre:</strong> {itemAEliminar.nombreVela}</p>
                <p><strong>Stock actual:</strong> {itemAEliminar.stockActual} unidades</p>
              </div>
              <Alert variant="info">
                <small>
                  ℹ️ Esta acción eliminará el registro del inventario. Si produces esta vela nuevamente, 
                  se creará un nuevo registro.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            🗑️ Sí, Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Inventario;

