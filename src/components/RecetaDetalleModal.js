import React from 'react';
import { Modal, Button, Badge, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const RecetaDetalleModal = ({ show, onHide, receta }) => {
  const { usuario } = useAuth();
  if (!receta) return null;

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${Number(price).toFixed(2)}`;
  };

  // Obtener URL de imagen (prioriza imagen de receta sobre frasco)
  const getImageUrl = () => {
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

  const imageUrl = getImageUrl();

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div>
            {receta.codigo && (
              <Badge bg="secondary" className="me-2">{receta.codigo}</Badge>
            )}
            <strong>{receta.nombre || 'Receta sin nombre'}</strong>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          {/* Vista para USUARIOS NORMALES - Solo información básica */}
          {usuario?.rol !== 'admin' ? (
            <Col xs={12}>
              <Row>
                {/* Imagen */}
                <Col md={6} className="mb-3">
                  <Card>
                    <Card.Body className="text-center">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={receta.nombre}
                          style={{ 
                            width: '100%', 
                            maxWidth: '300px',
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f8f9fa" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="48"%3E🕯️%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '300px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          fontSize: '5rem'
                        }}>
                          🕯️
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Información básica */}
                <Col md={6}>
                  {/* Descripción */}
                  {receta.descripcion && (
                    <Card className="mb-3">
                      <Card.Header>
                        <strong>📝 Descripción</strong>
                      </Card.Header>
                      <Card.Body>
                        <p className="mb-0">{receta.descripcion}</p>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Precio de Venta */}
                  <Card className="border-success">
                    <Card.Header className="bg-success text-white">
                      <strong>💰 Precio de Venta</strong>
                    </Card.Header>
                    <Card.Body className="text-center">
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--aluen-gold-light)' }}>
                        {formatPrice(receta.precioVentaSugerido || 0)}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Estado del Inventario */}
                  {receta.inventarioDescontado && (
                    <Card className="mt-3 border-success">
                      <Card.Body className="text-center">
                        <Badge bg="success" style={{ fontSize: '1rem' }}>
                          ✓ Disponible
                        </Badge>
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Col>
          ) : (
            /* Vista para ADMINISTRADORES - Información completa */
            <>
              {/* Columna Izquierda - Imagen y Datos Básicos */}
              <Col md={5}>
                {/* Imagen del Frasco */}
                {imageUrl ? (
                  <Card className="mb-3">
                    <Card.Body className="text-center">
                      <img 
                        src={imageUrl} 
                        alt={receta.frasco?.nombre || 'Frasco'}
                        style={{ 
                          width: '100%', 
                          maxWidth: '250px',
                          height: 'auto',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="250"%3E%3Crect fill="%23f8f9fa" width="250" height="250"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3ESin imagen%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="mt-2">
                        <Badge bg="info">{receta.frasco?.nombre || 'Sin frasco'}</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="mb-3">
                    <Card.Body className="text-center">
                      <div style={{ 
                        width: '100%', 
                        height: '250px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <span className="text-muted">Sin imagen</span>
                      </div>
                      <div className="mt-2">
                        <Badge bg="info">{receta.frasco?.nombre || 'Sin frasco'}</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Información del Frasco */}
                <Card>
                  <Card.Header>
                    <strong>📦 Información del Frasco</strong>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-2">
                      <small className="text-muted">Nombre:</small>
                      <div><strong>{receta.frasco?.nombre || 'N/A'}</strong></div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Capacidad:</small>
                      <div><Badge bg="secondary">{receta.frasco?.capacidad || 0} ml</Badge></div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Material:</small>
                      <div>{receta.frasco?.material || 'N/A'}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Precio:</small>
                      <div><strong className="text-success">{formatPrice(receta.frasco?.precio || 0)}</strong></div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Columna Derecha - Detalles de la Receta */}
              <Col md={7}>
            {/* Descripción */}
            {receta.descripcion && (
              <Card className="mb-3">
                <Card.Body>
                  <small className="text-muted">Descripción:</small>
                  <p className="mb-0">{receta.descripcion}</p>
                </Card.Body>
              </Card>
            )}

            {/* Composición */}
            <Card className="mb-3">
              <Card.Header>
                <strong>🧪 Composición</strong>
              </Card.Header>
              <Card.Body>
                {/* Cera */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span><Badge bg="info">Cera</Badge></span>
                    <span><strong>{receta.cera?.porcentaje || 0}%</strong></span>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: `${receta.cera?.porcentaje || 0}%` }}
                    >
                      {Math.ceil((receta.gramajeTotal * (receta.cera?.porcentaje || 0)) / 100)}g
                    </div>
                  </div>
                  <small className="text-muted">Material: {receta.cera?.material?.nombre || 'N/A'}</small>
                </div>

                {/* Aditivo */}
                {receta.aditivo?.material && receta.aditivo?.porcentaje > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span><Badge bg="warning" text="dark">Aditivo</Badge></span>
                      <span><strong>{receta.aditivo?.porcentaje || 0}%</strong></span>
                    </div>
                    <div className="progress" style={{ height: '20px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${receta.aditivo?.porcentaje || 0}%` }}
                      >
                        {Math.ceil((receta.gramajeTotal * (receta.aditivo?.porcentaje || 0)) / 100)}g
                      </div>
                    </div>
                    <small className="text-muted">Material: {receta.aditivo?.material?.nombre || 'N/A'}</small>
                  </div>
                )}

                {/* Esencia */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span><Badge bg="success">Esencia</Badge></span>
                    <span><strong>{receta.esencia?.porcentaje || 0}%</strong></span>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${receta.esencia?.porcentaje || 0}%` }}
                    >
                      {Math.ceil((receta.gramajeTotal * (receta.esencia?.porcentaje || 0)) / 100)}g
                    </div>
                  </div>
                  <small className="text-muted">Material: {receta.esencia?.material?.nombre || 'N/A'}</small>
                </div>
              </Card.Body>
            </Card>

            {/* Cantidades */}
            <Card className="mb-3">
              <Card.Header>
                <strong>📊 Cantidades</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6}>
                    <div className="mb-3">
                      <small className="text-muted">Gramaje Total:</small>
                      <div><Badge bg="secondary" style={{ fontSize: '1rem' }}>{receta.gramajeTotal || 0}g</Badge></div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-3">
                      <small className="text-muted">Unidades a Producir:</small>
                      <div><Badge bg="primary" style={{ fontSize: '1rem' }}>{receta.unidadesProducir || 0} uds</Badge></div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Desglose de Costos */}
            <Card className="mb-3 border-success">
              <Card.Header className="bg-success text-white">
                <strong>💰 Desglose de Costos</strong>
              </Card.Header>
              <Card.Body>
                {/* Costo de Materiales */}
                <div className="mb-3 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Costo de Materiales:</strong>
                    <strong className="text-info">{formatPrice(receta.costoPorUnidad || 0)}</strong>
                  </div>
                  <small className="text-muted">Cera + Esencia + Aditivo + Frasco</small>
                </div>

                {/* Costos Fijos */}
                <div className="mb-3 p-2 bg-warning bg-opacity-10 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Costos Fijos:</strong>
                    <strong className="text-warning">{formatPrice(receta.costosFijosTotales || 4750)}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <Row>
                      <Col xs={6}>
                        <div>• Pabilo + Chapeta: ${(receta.costosFijos?.pabiloChapeta || 500).toFixed(0)}</div>
                        <div>• Trabajo: ${(receta.costosFijos?.trabajo || 2500).toFixed(0)}</div>
                        <div>• Servicios: ${(receta.costosFijos?.servicios || 400).toFixed(0)}</div>
                        <div>• Servilletas: ${(receta.costosFijos?.servilletas || 200).toFixed(0)}</div>
                      </Col>
                      <Col xs={6}>
                        <div>• Anilina: ${(receta.costosFijos?.anilina || 50).toFixed(0)}</div>
                        <div>• Stickers: ${(receta.costosFijos?.stickers || 100).toFixed(0)}</div>
                        <div>• Empaque: ${(receta.costosFijos?.empaque || 1000).toFixed(0)}</div>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Costo Total */}
                <div className="mb-3 p-2 bg-primary bg-opacity-10 rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Costo Total por Unidad:</strong>
                    <strong className="text-primary">
                      {formatPrice((receta.costoPorUnidad || 0) + (receta.costosFijosTotales || 4750))}
                    </strong>
                  </div>
                  <small className="text-muted">Materiales + Costos Fijos</small>
                </div>

                {/* Ganancia */}
                <div className="mb-3 p-2 bg-info bg-opacity-10 rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Ganancia ({receta.porcentajeGanancia || 20}%):</strong>
                    <strong className="text-info">
                      {formatPrice(((receta.costoPorUnidad || 0) + (receta.costosFijosTotales || 4750)) * ((receta.porcentajeGanancia || 20) / 100))}
                    </strong>
                  </div>
                </div>

                {/* Precio de Venta Sugerido */}
                <div className="p-3 bg-success bg-opacity-10 rounded border border-success">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong style={{ fontSize: '1.1rem' }}>💵 Precio de Venta Sugerido:</strong>
                    <strong className="text-success" style={{ fontSize: '1.3rem' }}>
                      {formatPrice(receta.precioVentaSugerido || 0)}
                    </strong>
                  </div>
                  <small className="text-muted">Costo Total + {receta.porcentajeGanancia || 20}% de ganancia</small>
                </div>
              </Card.Body>
            </Card>

                {/* Estado del Inventario */}
                {receta.inventarioDescontado && (
                  <Card className="mb-3 border-success">
                    <Card.Body className="text-center">
                      <Badge bg="success" style={{ fontSize: '1rem' }}>
                        ✓ Inventario Descontado
                      </Badge>
                      <div className="mt-2">
                        <small className="text-muted">Los materiales han sido descontados del inventario</small>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </>
          )}
        </Row>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecetaDetalleModal;

