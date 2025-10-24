import React, { useState, useEffect } from 'react';
import { reportesAPI, ventasAPI } from '../services/api';
import { Card, Row, Col, Badge, Table, Button, Tabs, Tab, Form, Modal, Accordion } from 'react-bootstrap';

const Reportes = () => {
  const [activeTab, setActiveTab] = useState('costos');
  const [costosData, setCostosData] = useState([]);
  const [inventarioData, setInventarioData] = useState({ 
    inventario: { materiales: [], frascos: [], velasTerminadas: [] }, 
    alertas: { materialesBajos: [], frascosBajos: [], velasBajas: [], totalAlertas: 0 }, 
    resumen: {} 
  });
  const [ventasData, setVentasData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtrosPDF, setFiltrosPDF] = useState({ fechaInicio: '', fechaFin: '' });
  const [showDetalleVentasModal, setShowDetalleVentasModal] = useState(false);
  const [todasLasVentas, setTodasLasVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showDetalleIndividualModal, setShowDetalleIndividualModal] = useState(false);

  useEffect(() => {
    fetchReportesData();
  }, []);

  const fetchReportesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [costosRes, inventarioRes, ventasRes] = await Promise.all([
        reportesAPI.getCostos(),
        reportesAPI.getInventario(),
        ventasAPI.getEstadisticas()
      ]);
      
      setCostosData(Array.isArray(costosRes.data) ? costosRes.data : []);
      setInventarioData(inventarioRes.data || { 
        inventario: { materiales: [], frascos: [], velasTerminadas: [] }, 
        alertas: { materialesBajos: [], frascosBajos: [], velasBajas: [], totalAlertas: 0 }, 
        resumen: {} 
      });
      setVentasData(ventasRes.data || {});
    } catch (err) {
      setError('Error al cargar los reportes');
      console.error('Reportes error:', err);
      // Establecer valores por defecto en caso de error
      setCostosData([]);
      setInventarioData({ 
        inventario: { materiales: [], frascos: [], velasTerminadas: [] }, 
        alertas: { materialesBajos: [], frascosBajos: [], velasBajas: [], totalAlertas: 0 }, 
        resumen: {} 
      });
      setVentasData({});
    } finally {
      setLoading(false);
    }
  };

  const descargarPDFVentas = () => {
    const url = reportesAPI.descargarPDFVentas(filtrosPDF);
    const token = localStorage.getItem('token');
    
    // Crear elemento temporal para descarga
    const link = document.createElement('a');
    link.href = `http://localhost:5000${url}`;
    link.setAttribute('download', `reporte-ventas-${Date.now()}.pdf`);
    
    // Agregar token a la petición
    fetch(link.href, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ventas-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el reporte PDF');
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${Number(price).toFixed(2)}`;
  };

  const verTodasLasVentas = async () => {
    try {
      const response = await ventasAPI.getAll(filtrosPDF);
      setTodasLasVentas(response.data.ventas || response.data || []);
      setShowDetalleVentasModal(true);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      alert('Error al cargar las ventas');
    }
  };

  const verDetalleVenta = (venta) => {
    setVentaSeleccionada(venta);
    setShowDetalleIndividualModal(true);
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

  // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Reportes</h1>
        <Button variant="outline-primary" onClick={fetchReportesData}>
          🔄 Actualizar Reportes
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="costos" title="Costos por Receta">
          <div className="row">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Análisis de Costos por Receta</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Receta</th>
                          <th>Frasco</th>
                          <th>Gramaje Total</th>
                          <th>Costo Total</th>
                          <th>Costo por Gramo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costosData && costosData.length > 0 ? (
                          costosData.map((receta, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{receta.nombre}</strong>
                                {receta.unidadesProducir && (
                                  <div><small className="text-muted">{receta.unidadesProducir} unidades</small></div>
                                )}
                            </td>
                              <td>{receta.frasco || 'N/A'}</td>
                            <td>
                              <Badge bg="info">{receta.gramajeTotal}g</Badge>
                            </td>
                            <td>
                              <strong className="text-success">
                                  {formatPrice(receta.costoTotal || receta.costoPorUnidad || 0)}
                              </strong>
                            </td>
                            <td>
                                {formatPrice(receta.costoPorGramo || 0)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No hay datos de costos disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Tab>

        <Tab eventKey="inventario" title="📦 Inventario">
          {/* Alertas de stock bajo */}
          {inventarioData?.alertas && inventarioData.alertas.totalAlertas > 0 && (
            <Row className="mb-4">
              <Col>
                <Card className="border-danger">
                  <Card.Header className="bg-danger text-white">
                    <h5 className="mb-0">⚠️ Alertas de Stock Bajo ({inventarioData.alertas.totalAlertas})</h5>
                </Card.Header>
                <Card.Body>
                    {inventarioData.alertas.materialesBajos.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-danger">Materiales que necesitan compra:</h6>
                        <Table striped size="sm">
                          <thead>
                            <tr>
                              <th>Material</th>
                              <th>Tipo</th>
                              <th>Stock Actual</th>
                              <th>Cantidad Sugerida a Comprar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventarioData.alertas.materialesBajos.map((material, index) => (
                              <tr key={index}>
                                <td><strong>{material.nombre}</strong></td>
                                <td><Badge bg="secondary">{material.tipo}</Badge></td>
                                <td className="text-danger">{material.stock}g</td>
                                <td className="text-success fw-bold">{material.cantidadSugerida}g</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    {inventarioData.alertas.frascosBajos.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-danger">Frascos que necesitan compra:</h6>
                        <Table striped size="sm">
                          <thead>
                            <tr>
                              <th>Frasco</th>
                              <th>Capacidad</th>
                              <th>Stock Actual</th>
                              <th>Cantidad Sugerida a Comprar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventarioData.alertas.frascosBajos.map((frasco, index) => (
                              <tr key={index}>
                                <td><strong>{frasco.nombre}</strong></td>
                                <td>{frasco.capacidad}ml</td>
                                <td className="text-danger">{frasco.stock} uds</td>
                                <td className="text-success fw-bold">{frasco.cantidadSugerida} uds</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    {inventarioData.alertas.velasBajas && inventarioData.alertas.velasBajas.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-danger">🕯️ Velas que necesitan producción:</h6>
                        <Table striped size="sm">
                          <thead>
                            <tr>
                              <th>Vela</th>
                              <th>Stock Actual</th>
                              <th>Stock Mínimo</th>
                              <th>Cantidad Sugerida a Producir</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventarioData.alertas.velasBajas.map((vela, index) => (
                              <tr key={index}>
                                <td><strong>{vela.nombreVela}</strong></td>
                                <td className="text-danger">{vela.stockActual} uds</td>
                                <td>{vela.stockMinimo} uds</td>
                                <td className="text-success fw-bold">{vela.cantidadSugerida} uds</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Resumen de inventario */}
          {inventarioData?.resumen && (
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h6>Valor Total Inventario</h6>
                    <h3 className="text-primary">{formatPrice(inventarioData.resumen.valorTotal || 0)}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h6>Tipos de Materiales</h6>
                    <h3 className="text-info">{inventarioData.resumen.cantidadTiposMateriales || 0}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h6>Tipos de Frascos</h6>
                    <h3 className="text-success">{inventarioData.resumen.cantidadTiposFrascos || 0}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center bg-light">
                  <Card.Body>
                    <h6>🕯️ Velas Terminadas</h6>
                    <h3 className="text-warning">{inventarioData.resumen.cantidadTiposVelas || 0}</h3>
                    <small className="text-muted">tipos</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Accordion defaultActiveKey="0">
            {/* Sección 1: Materiales en Stock */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <h5 className="mb-0">📦 Materiales en Stock</h5>
                <Badge bg="info" className="ms-2">
                  {inventarioData?.inventario?.materiales?.length || 0} items
                </Badge>
              </Accordion.Header>
              <Accordion.Body>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Tipo</th>
                          <th>Stock</th>
                        <th>Nivel</th>
                          <th>Precio/Unidad</th>
                          <th>Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                      {inventarioData?.inventario?.materiales && inventarioData.inventario.materiales.length > 0 ? (
                        inventarioData.inventario.materiales.map((material, index) => (
                          <tr key={index} className={material.necesitaCompra ? 'table-danger' : ''}>
                            <td>{material.nombre || 'N/A'}</td>
                            <td>
                              <Badge bg="primary">{material.tipo || 'N/A'}</Badge>
                            </td>
                            <td>
                              <span className={material.nivelStock === 'bajo' ? 'text-danger fw-bold' : material.nivelStock === 'medio' ? 'text-warning' : 'text-success'}>
                                {material.stock || 0} {material.unidad || 'g'}
                              </span>
                            </td>
                            <td>
                              <Badge bg={material.nivelStock === 'bajo' ? 'danger' : material.nivelStock === 'medio' ? 'warning' : 'success'}>
                                {(material.nivelStock || 'medio').toUpperCase()}
                              </Badge>
                            </td>
                            <td>{formatPrice(material.precioPorUnidad || 0)}</td>
                            <td>
                              <strong>{formatPrice(material.valorTotal || 0)}</strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No hay materiales registrados
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </Table>
                  </div>
              </Accordion.Body>
            </Accordion.Item>

            {/* Sección 2: Frascos en Stock */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <h5 className="mb-0">🫙 Frascos en Stock</h5>
                <Badge bg="success" className="ms-2">
                  {inventarioData?.inventario?.frascos?.length || 0} items
                </Badge>
              </Accordion.Header>
              <Accordion.Body>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Frasco</th>
                        <th>Capacidad</th>
                          <th>Stock</th>
                        <th>Nivel</th>
                          <th>Precio</th>
                          <th>Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                      {inventarioData?.inventario?.frascos && inventarioData.inventario.frascos.length > 0 ? (
                        inventarioData.inventario.frascos.map((frasco, index) => (
                          <tr key={index} className={frasco.necesitaCompra ? 'table-danger' : ''}>
                            <td>{frasco.nombre || 'N/A'}</td>
                            <td>{frasco.capacidad || 0}ml</td>
                            <td>
                              <span className={frasco.nivelStock === 'bajo' ? 'text-danger fw-bold' : frasco.nivelStock === 'medio' ? 'text-warning' : 'text-success'}>
                                {frasco.stock || 0} uds
                              </span>
                            </td>
                            <td>
                              <Badge bg={frasco.nivelStock === 'bajo' ? 'danger' : frasco.nivelStock === 'medio' ? 'warning' : 'success'}>
                                {(frasco.nivelStock || 'medio').toUpperCase()}
                              </Badge>
                            </td>
                            <td>{formatPrice(frasco.precio || 0)}</td>
                            <td>
                              <strong>{formatPrice(frasco.valorTotal || 0)}</strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No hay frascos registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            {/* Sección 3: Velas Terminadas */}
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <h5 className="mb-0">🕯️ Velas Terminadas (Inventario de Productos)</h5>
                <Badge bg="warning" text="dark" className="ms-2">
                  {inventarioData?.inventario?.velasTerminadas?.length || 0} items
                </Badge>
              </Accordion.Header>
              <Accordion.Body>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Nombre de la Vela</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Nivel</th>
                        <th>Costo por Unidad</th>
                        <th>Valor Total</th>
                        <th>Última Producción</th>
                        <th>Última Venta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioData?.inventario?.velasTerminadas && inventarioData.inventario.velasTerminadas.length > 0 ? (
                        inventarioData.inventario.velasTerminadas.map((vela, index) => (
                          <tr key={index} className={vela.necesitaProduccion ? 'table-warning' : ''}>
                            <td>
                              <strong>{vela.nombreVela || 'N/A'}</strong>
                              {vela.necesitaProduccion && <Badge bg="warning" text="dark" className="ms-2">¡Producir!</Badge>}
                            </td>
                            <td>
                              <span className={vela.nivelStock === 'bajo' ? 'text-danger fw-bold' : vela.nivelStock === 'medio' ? 'text-warning' : 'text-success'}>
                                {vela.stockActual || 0} uds
                              </span>
                            </td>
                            <td>{vela.stockMinimo || 0} uds</td>
                            <td>
                              <Badge bg={vela.nivelStock === 'bajo' ? 'danger' : vela.nivelStock === 'medio' ? 'warning' : 'success'}>
                                {(vela.nivelStock || 'medio').toUpperCase()}
                              </Badge>
                            </td>
                            <td>{formatPrice(vela.costoPorUnidad || 0)}</td>
                            <td>
                              <strong>{formatPrice(vela.valorTotal || 0)}</strong>
                            </td>
                            <td>
                              {vela.ultimaProduccion ? (
                                <small>
                                  {new Date(vela.ultimaProduccion.fecha).toLocaleDateString()}<br/>
                                  <Badge bg="success">+{vela.ultimaProduccion.cantidad} uds</Badge>
                                </small>
                              ) : (
                                <small className="text-muted">Nunca</small>
                              )}
                            </td>
                            <td>
                              {vela.ultimaVenta ? (
                                <small>
                                  {new Date(vela.ultimaVenta.fecha).toLocaleDateString()}<br/>
                                  <Badge bg="danger">-{vela.ultimaVenta.cantidad} uds</Badge>
                                </small>
                              ) : (
                                <small className="text-muted">Nunca</small>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            No hay velas terminadas en inventario. Produce recetas para agregarlas al inventario.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Tab>

        <Tab eventKey="ventas" title="📊 Ventas">
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Reporte de Ventas</h5>
                  <div>
                    <Button variant="info" onClick={verTodasLasVentas} className="me-2">
                      👁️ Ver Todas las Ventas
                    </Button>
                    <Button variant="success" onClick={descargarPDFVentas}>
                      📄 Descargar PDF
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha Inicio</Form.Label>
                          <Form.Control
                            type="date"
                            value={filtrosPDF.fechaInicio}
                            onChange={(e) => setFiltrosPDF({...filtrosPDF, fechaInicio: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha Fin</Form.Label>
                          <Form.Control
                            type="date"
                            value={filtrosPDF.fechaFin}
                            onChange={(e) => setFiltrosPDF({...filtrosPDF, fechaFin: e.target.value})}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <p className="text-muted">
                      El PDF incluirá: resumen ejecutivo, productos más vendidos, ventas por método de pago y detalle completo de ventas.
                    </p>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {ventasData && (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Total Ventas</h6>
                      <h2>{ventasData.totalVentas || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Ingresos Totales</h6>
                      <h2 className="text-success">${(ventasData.ingresosTotales || 0).toFixed(2)}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Ticket Promedio</h6>
                      <h2>${ventasData.totalVentas > 0 ? (ventasData.ingresosTotales / ventasData.totalVentas).toFixed(2) : '0.00'}</h2>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6 className="text-muted">Productos Únicos</h6>
                      <h2>{ventasData.productosMasVendidos?.length || 0}</h2>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Top 10 Productos Más Vendidos</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ventasData.productosMasVendidos?.slice(0, 10).map((producto, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td><strong>{producto.nombre}</strong></td>
                              <td><Badge bg="primary">{producto.cantidad}</Badge></td>
                              <td className="text-success">${producto.ingresos.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Ventas por Método de Pago</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Método</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ventasData.ventasPorMetodo?.map((metodo, index) => (
                            <tr key={index}>
                              <td className="text-capitalize"><strong>{metodo._id}</strong></td>
                              <td><Badge bg="info">{metodo.count}</Badge></td>
                              <td className="text-success">${metodo.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Tab>
      </Tabs>

      {/* Modal con Todas las Ventas */}
      <Modal show={showDetalleVentasModal} onHide={() => setShowDetalleVentasModal(false)} size="xl" fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title>📊 Todas las Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {todasLasVentas.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No hay ventas para mostrar</h5>
              <p>Intenta ajustar los filtros de fecha</p>
            </div>
          ) : (
            <Table responsive hover striped>
              <thead className="sticky-top bg-light">
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Método Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {todasLasVentas.map((venta) => (
                  <tr key={venta._id}>
                    <td><strong>{venta.numeroVenta}</strong></td>
                    <td>{new Date(venta.fecha).toLocaleDateString('es-ES')}</td>
                    <td>
                      <strong>{venta.cliente?.nombre || 'N/A'}</strong>
                      {venta.cliente?.email && (
                        <div><small className="text-muted">{venta.cliente.email}</small></div>
                      )}
                    </td>
                    <td>
                      <Badge bg="secondary">{venta.items?.length || 0} item(s)</Badge>
                    </td>
                    <td>
                      <strong className="text-success">${(venta.total || 0).toFixed(2)}</strong>
                    </td>
                    <td className="text-capitalize">{venta.metodoPago || 'N/A'}</td>
                    <td>
                      <Badge bg={getEstadoBadge(venta.estado)} className="text-capitalize">
                        {venta.estado || 'N/A'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => verDetalleVenta(venta)}
                      >
                        👁️ Ver
                      </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              <strong>Total de ventas:</strong> {todasLasVentas.length}
              {todasLasVentas.length > 0 && (
                <>
                  {' | '}
                  <strong>Ingresos totales:</strong> ${todasLasVentas.reduce((sum, v) => sum + (v.total || 0), 0).toFixed(2)}
                </>
              )}
            </div>
            <Button variant="secondary" onClick={() => setShowDetalleVentasModal(false)}>
              Cerrar
            </Button>
                  </div>
        </Modal.Footer>
      </Modal>

      {/* Modal Detalle Individual de Venta */}
      <Modal show={showDetalleIndividualModal} onHide={() => setShowDetalleIndividualModal(false)} size="lg">
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
          <Button variant="secondary" onClick={() => setShowDetalleIndividualModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reportes;
