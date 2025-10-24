import React, { useState, useEffect } from 'react';
import { ventasAPI, inventarioAPI, puntosVentaAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Alert, Form, Modal, Table, Badge } from 'react-bootstrap';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [filtros, setFiltros] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    cliente: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    puntoVenta: '',
    items: [],
    descuento: 0,
    impuestos: 0,
    metodoPago: 'efectivo',
    notas: ''
  });
  
  const [nuevoItem, setNuevoItem] = useState({
    receta: '',
    frasco: '',
    cantidad: 1,
    precioUnitario: 0,
    descripcion: '',
    searchTerm: '',
    showSearchResults: false
  });

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ventasRes, inventarioRes, puntosVentaRes] = await Promise.all([
        ventasAPI.getAll(filtros),
        inventarioAPI.getAll(),  // Cargar inventario con recetas populadas
        puntosVentaAPI.getAll({ activo: 'true' })  // Cargar puntos de venta activos
      ]);
      
      setVentas(ventasRes.data.ventas || ventasRes.data);
      setInventario(inventarioRes.data);
      setPuntosVenta(puntosVentaRes.data || []);
      
      console.log('📦 Inventario cargado:', inventarioRes.data.length, 'items totales');
      console.log('📍 Puntos de venta cargados:', puntosVentaRes.data?.length || 0);
      
      // Debug: Mostrar detalles del inventario
      const itemsConStock = inventarioRes.data.filter(item => item.stockActual > 0);
      const itemsConReceta = inventarioRes.data.filter(item => item.receta && item.receta._id);
      const itemsValidos = inventarioRes.data.filter(item => item.receta && item.receta._id && item.stockActual > 0);
      
      console.log('📊 Análisis del inventario:');
      console.log('  - Items con stock > 0:', itemsConStock.length);
      console.log('  - Items con receta válida:', itemsConReceta.length);
      console.log('  - Items válidos para venta:', itemsValidos.length);
      
      if (itemsValidos.length > 0) {
        console.log('✅ Productos disponibles para venta:', itemsValidos.map(item => ({
          nombre: item.nombreVela,
          codigo: item.receta?.codigo,
          stock: item.stockActual
        })));
      } else {
        console.warn('⚠️ No hay productos disponibles para venta en el inventario');
      }
      
      setError('');
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = () => {
    if (!nuevoItem.receta || nuevoItem.cantidad <= 0 || nuevoItem.precioUnitario < 0) {
      alert('Complete todos los campos requeridos del producto');
      return;
    }

    console.log('🔍 Buscando inventario para receta:', nuevoItem.receta);
    console.log('📦 Items de inventario disponibles:', inventario.length);
    
    // Buscar el item en el inventario
    let itemInventario = inventario.find(inv => inv.receta?._id === nuevoItem.receta);
    
    if (!itemInventario) {
      console.error('❌ No se encontró inventario para:', {
        recetaId: nuevoItem.receta,
        inventarioDisponible: inventario.map(inv => ({
          nombreVela: inv.nombreVela,
          recetaId: inv.receta?._id || inv.receta,
          stock: inv.stockActual
        }))
      });
      alert(`Producto sin inventario disponible.\n\nVerifica que hayas producido esta vela en el módulo de Recetas.`);
      return;
    }
    
    console.log('✅ Inventario encontrado:', {
      nombreVela: itemInventario.nombreVela,
      stockActual: itemInventario.stockActual,
      recetaId: itemInventario.receta?._id
    });
    
    // Verificar stock disponible
    console.log('📊 Stock disponible:', itemInventario.stockActual, 'unidades');
    if (itemInventario.stockActual < nuevoItem.cantidad) {
      alert(`Stock insuficiente. Disponible: ${itemInventario.stockActual} unidades`);
      return;
    }
    
    // Preparar item sin campos vacíos
    const itemToAdd = {
      receta: nuevoItem.receta,
      recetaNombre: itemInventario.nombreVela,
      cantidad: nuevoItem.cantidad,
      precioUnitario: nuevoItem.precioUnitario,
      descripcion: nuevoItem.descripcion || ''
    };
    
    // Solo agregar frasco si tiene valor
    if (nuevoItem.frasco && nuevoItem.frasco !== '') {
      itemToAdd.frasco = nuevoItem.frasco;
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, itemToAdd]
    });

    setNuevoItem({
      receta: '',
      frasco: '',
      cantidad: 1,
      precioUnitario: 0,
      descripcion: '',
      searchTerm: '',
      showSearchResults: false
    });
  };

  const eliminarItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calcularSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - formData.descuento + formData.impuestos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    try {
      // Calcular subtotales de items y totales
      const itemsConSubtotal = formData.items.map(item => ({
        ...item,
        subtotal: item.cantidad * item.precioUnitario
      }));
      
      const subtotal = itemsConSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
      const total = subtotal - (formData.descuento || 0) + (formData.impuestos || 0);
      
      const ventaData = {
        ...formData,
        items: itemsConSubtotal,
        subtotal: subtotal,
        total: total
      };
      
      await ventasAPI.create(ventaData);
      setShowModal(false);
      resetForm();
      cargarDatos();
      alert('Venta registrada exitosamente');
    } catch (err) {
      alert('Error al registrar la venta: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: { nombre: '', email: '', telefono: '', direccion: '' },
      puntoVenta: '',
      items: [],
      descuento: 0,
      impuestos: 0,
      metodoPago: 'efectivo',
      notas: ''
    });
    setNuevoItem({
      receta: '',
      molde: '',
      frasco: '',
      cantidad: 1,
      precioUnitario: 0,
      descripcion: ''
    });
  };

  // Función para cambiar estado de venta (actualmente no se usa en la UI)
  // const cambiarEstadoVenta = async (id, nuevoEstado) => {
  //   if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;
  //   
  //   try {
  //     await ventasAPI.cambiarEstado(id, nuevoEstado);
  //     cargarDatos();
  //   } catch (err) {
  //     alert('Error al cambiar estado');
  //   }
  // };

  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta venta?')) return;
    
    try {
      await ventasAPI.delete(id);
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar la venta');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      completada: 'success',
      pendiente: 'warning',
      cancelada: 'danger',
      reembolsada: 'secondary'
    };
    return badges[estado] || 'secondary';
  };

  const verDetalleVenta = (venta) => {
    setVentaSeleccionada(venta);
    setShowDetalleModal(true);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2>💰 Gestión de Ventas</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            ➕ Nueva Venta
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select 
                  value={filtros.estado || ''}
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                >
                  <option value="">Todos</option>
                  <option value="completada">Completada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Método de Pago</Form.Label>
                <Form.Select 
                  value={filtros.metodoPago || ''}
                  onChange={(e) => setFiltros({...filtros, metodoPago: e.target.value})}
                >
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>📍 Punto de Venta</Form.Label>
                <Form.Select 
                  value={filtros.puntoVenta || ''}
                  onChange={(e) => setFiltros({...filtros, puntoVenta: e.target.value})}
                >
                  <option value="">Todos</option>
                  {puntosVenta.map(punto => (
                    <option key={punto._id} value={punto._id}>
                      {punto.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Buscar Cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre o email..."
                  value={filtros.cliente || ''}
                  onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary"
                onClick={() => setFiltros({})}
                className="w-100"
              >
                🔄 Limpiar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Ventas */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Punto de Venta</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Método Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta._id}>
                    <td>{venta.numeroVenta}</td>
                    <td>{new Date(venta.fecha).toLocaleDateString('es-ES')}</td>
                    <td>
                      <strong>{venta.cliente.nombre}</strong>
                      {venta.cliente.email && <div><small className="text-muted">{venta.cliente.email}</small></div>}
                    </td>
                    <td>
                      {venta.puntoVentaNombre ? (
                        <span>📍 {venta.puntoVentaNombre}</span>
                      ) : (
                        <span className="text-muted">Sin especificar</span>
                      )}
                    </td>
                    <td>{venta.items.length} item(s)</td>
                    <td><strong>${venta.total.toFixed(2)}</strong></td>
                    <td className="text-capitalize">{venta.metodoPago}</td>
                    <td>
                      <Badge bg={getEstadoBadge(venta.estado)} className="text-capitalize">
                        {venta.estado}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => verDetalleVenta(venta)}
                        className="me-2"
                      >
                        👁️ Ver
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarVenta(venta._id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Nueva Venta */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>➕ Nueva Venta</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Datos del Cliente */}
            <h5 className="mb-3">👤 Datos del Cliente</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cliente.nombre}
                    onChange={(e) => setFormData({
                      ...formData,
                      cliente: {...formData.cliente, nombre: e.target.value}
                    })}
                    placeholder="Cliente general"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.cliente.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      cliente: {...formData.cliente, email: e.target.value}
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.cliente.telefono}
                    onChange={(e) => setFormData({
                      ...formData,
                      cliente: {...formData.cliente, telefono: e.target.value}
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.cliente.direccion}
                    onChange={(e) => setFormData({
                      ...formData,
                      cliente: {...formData.cliente, direccion: e.target.value}
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>📍 Punto de Venta</Form.Label>
                  <Form.Select
                    value={formData.puntoVenta}
                    onChange={(e) => setFormData({
                      ...formData,
                      puntoVenta: e.target.value
                    })}
                  >
                    <option value="">-- Seleccione un punto de venta --</option>
                    {puntosVenta.map(punto => (
                      <option key={punto._id} value={punto._id}>
                        {punto.nombre}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Opcional. Selecciona el punto de venta donde se realiza la transacción.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <hr />

            {/* Agregar Producto */}
            <h5 className="mb-3">🛒 Agregar Producto</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Seleccionar Producto *</Form.Label>
                  <Form.Select
                    value={nuevoItem.receta}
                    onChange={(e) => {
                      const recetaId = e.target.value;
                      const itemInventarioSel = inventario.find(inv => inv.receta?._id === recetaId);
                      if (itemInventarioSel && itemInventarioSel.receta) {
                        setNuevoItem({
                          ...nuevoItem,
                          receta: recetaId,
                          searchTerm: `${itemInventarioSel.receta.codigo ? itemInventarioSel.receta.codigo + ' - ' : ''}${itemInventarioSel.nombreVela}`,
                          precioUnitario: itemInventarioSel.receta.precioVentaSugerido || 0,
                          showSearchResults: false
                        });
                      } else {
                        setNuevoItem({
                          ...nuevoItem,
                          receta: '',
                          searchTerm: '',
                          precioUnitario: 0
                        });
                      }
                    }}
                  >
                    <option value="">-- Seleccione un producto --</option>
                    {inventario
                      .filter(item => {
                        // Solo mostrar items con stock Y con receta válida
                        const tieneStock = item.stockActual > 0;
                        const tieneReceta = item.receta && item.receta._id;
                        return tieneStock && tieneReceta;
                      })
                      .map(item => {
                        const receta = item.receta;
                        
                        return (
                          <option 
                            key={item._id} 
                            value={receta._id}
                          >
                            {receta.codigo ? `${receta.codigo} - ` : ''}{item.nombreVela} | Stock: {item.stockActual} | ${receta.precioVentaSugerido ? receta.precioVentaSugerido.toFixed(2) : 'N/A'}
                          </option>
                        );
                      })}
                  </Form.Select>
                  {nuevoItem.receta && (() => {
                    const itemInv = inventario.find(inv => inv.receta?._id === nuevoItem.receta);
                    return itemInv && (
                      <Form.Text className="text-success">
                        ✓ Stock disponible: {itemInv.stockActual} unidades
                      </Form.Text>
                    );
                  })()}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>O Buscar por Código/Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por código o nombre..."
                    value={nuevoItem.searchTerm || ''}
                    onChange={(e) => {
                      setNuevoItem({
                        ...nuevoItem,
                        searchTerm: e.target.value,
                        showSearchResults: true
                      });
                    }}
                    onFocus={() => setNuevoItem({...nuevoItem, showSearchResults: true})}
                  />
                  {nuevoItem.showSearchResults && nuevoItem.searchTerm && (
                    <div 
                      style={{
                        position: 'absolute',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        width: '100%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {inventario.filter(item => {
                        // Solo items con stock Y con receta válida
                        if (!item.receta || !item.receta._id || item.stockActual === 0) return false;
                        const term = nuevoItem.searchTerm.toLowerCase();
                        return item.nombreVela.toLowerCase().includes(term) || 
                               (item.receta.codigo && item.receta.codigo.toLowerCase().includes(term));
                      }).length === 0 ? (
                        <div className="p-3 text-center text-muted">
                          No se encontraron productos con stock disponible
                        </div>
                      ) : (
                        inventario.filter(item => {
                          // Solo items con stock Y con receta válida
                          if (!item.receta || !item.receta._id || item.stockActual === 0) return false;
                          const term = nuevoItem.searchTerm.toLowerCase();
                          return item.nombreVela.toLowerCase().includes(term) || 
                                 (item.receta.codigo && item.receta.codigo.toLowerCase().includes(term));
                        }).map(item => {
                          const receta = item.receta;
                          
                          return (
                            <div
                              key={item._id}
                              style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: nuevoItem.receta === receta._id ? '#f0f0f0' : 'white'
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = nuevoItem.receta === receta._id ? '#f0f0f0' : 'white')}
                              onClick={() => {
                                setNuevoItem({
                                  ...nuevoItem,
                                  receta: receta._id,
                                  searchTerm: `${receta.codigo ? receta.codigo + ' - ' : ''}${item.nombreVela}`,
                                  precioUnitario: receta.precioVentaSugerido || 0,
                                  showSearchResults: false
                                });
                              }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{receta.codigo ? `${receta.codigo} - ` : ''}{item.nombreVela}</strong>
                                  <div>
                                    <small className="text-success">
                                      ✅ Stock: {item.stockActual} unidades
                                    </small>
                                  </div>
                                </div>
                                {receta.precioVentaSugerido && (
                                  <span className="text-success">
                                    ${receta.precioVentaSugerido.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  {nuevoItem.receta && (
                    <Form.Text className="text-success">
                      ✓ Producto seleccionado
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={nuevoItem.cantidad}
                    onChange={(e) => setNuevoItem({...nuevoItem, cantidad: parseInt(e.target.value) || 1})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio Unit. *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={nuevoItem.precioUnitario}
                    onChange={(e) => setNuevoItem({...nuevoItem, precioUnitario: parseFloat(e.target.value) || 0})}
                  />
                  {nuevoItem.receta && (
                    <Form.Text className="text-success">
                      ✓ Precio sugerido aplicado
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Subtotal</Form.Label>
                  <div className="p-2 bg-light border rounded text-center">
                    <strong>${(nuevoItem.cantidad * nuevoItem.precioUnitario).toFixed(2)}</strong>
                  </div>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="success" className="mb-3 w-100" onClick={agregarItem}>
                  ➕ Agregar
                </Button>
              </Col>
            </Row>

            {/* Lista de Items */}
            {formData.items.length > 0 && (
              <>
                <h6 className="mt-3">Productos Agregados:</h6>
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.recetaNombre}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.precioUnitario.toFixed(2)}</td>
                        <td>${(item.cantidad * item.precioUnitario).toFixed(2)}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminarItem(index)}
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

            <hr />

            {/* Totales y Pago */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    value={formData.metodoPago}
                    onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.descuento}
                    onChange={(e) => setFormData({...formData, descuento: parseFloat(e.target.value) || 0})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Impuestos</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.impuestos}
                    onChange={(e) => setFormData({...formData, impuestos: parseFloat(e.target.value) || 0})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Total</Form.Label>
                  <h3 className="text-primary">${calcularTotal().toFixed(2)}</h3>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              💾 Registrar Venta
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Detalle de Venta */}
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📄 Detalle de Venta #{ventaSeleccionada?.numeroVenta}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaSeleccionada && (
            <>
              {/* Información General */}
              <Card className="mb-3">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">📋 Información General</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p className="mb-2">
                        <strong>Número de Venta:</strong> {ventaSeleccionada.numeroVenta}
                      </p>
                      <p className="mb-2">
                        <strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="mb-2">
                        <strong>Método de Pago:</strong> <span className="text-capitalize">{ventaSeleccionada.metodoPago}</span>
                      </p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-2">
                        <strong>Estado:</strong>{' '}
                        <Badge bg={getEstadoBadge(ventaSeleccionada.estado)} className="text-capitalize">
                          {ventaSeleccionada.estado}
                        </Badge>
                      </p>
                      {ventaSeleccionada.notas && (
                        <p className="mb-2">
                          <strong>Notas:</strong> {ventaSeleccionada.notas}
                        </p>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Información del Cliente */}
              <Card className="mb-3">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">👤 Datos del Cliente</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p className="mb-2">
                        <strong>Nombre:</strong> {ventaSeleccionada.cliente?.nombre || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong> {ventaSeleccionada.cliente?.email || 'N/A'}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-2">
                        <strong>Teléfono:</strong> {ventaSeleccionada.cliente?.telefono || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Dirección:</strong> {ventaSeleccionada.cliente?.direccion || 'N/A'}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Productos */}
              <Card className="mb-3">
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">🛒 Productos</h6>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaSeleccionada.items && ventaSeleccionada.items.length > 0 ? (
                        ventaSeleccionada.items.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{item.recetaNombre || item.receta?.nombre || 'Sin nombre'}</strong>
                              {item.descripcion && (
                                <div>
                                  <small className="text-muted">{item.descripcion}</small>
                                </div>
                              )}
                            </td>
                            <td>{item.cantidad}</td>
                            <td>${(item.precioUnitario || 0).toFixed(2)}</td>
                            <td>
                              <strong>${((item.cantidad || 0) * (item.precioUnitario || 0)).toFixed(2)}</strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No hay productos en esta venta
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Resumen de Totales */}
              <Card className="mb-0">
                <Card.Header className="bg-warning text-dark">
                  <h6 className="mb-0">💰 Resumen de Totales</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p className="mb-2">
                        <strong>Subtotal:</strong> ${(ventaSeleccionada.subtotal || 0).toFixed(2)}
                      </p>
                      <p className="mb-2">
                        <strong>Descuento:</strong> ${(ventaSeleccionada.descuento || 0).toFixed(2)}
                      </p>
                      <p className="mb-2">
                        <strong>Impuestos:</strong> ${(ventaSeleccionada.impuestos || 0).toFixed(2)}
                      </p>
                    </Col>
                    <Col md={6} className="text-end">
                      <h4 className="text-primary mb-0">
                        <strong>Total:</strong> ${(ventaSeleccionada.total || 0).toFixed(2)}
                      </h4>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Ventas;
