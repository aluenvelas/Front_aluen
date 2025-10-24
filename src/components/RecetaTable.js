import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const RecetaTable = ({ recetas, onEdit, onDelete, onViewDetails, onEditImage, onToggleVisibilidad }) => {
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${Number(price).toFixed(2)}`;
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

  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Imagen</th>
            <th>Composición</th>
            <th>Frasco</th>
            <th>Gramaje</th>
            <th>Unidades</th>
            <th>Costo Materiales</th>
            <th>Costos Fijos</th>
            <th>Precio Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recetas.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center text-muted">
                No hay recetas registradas
              </td>
            </tr>
          ) : (
            recetas.map((receta) => (
              <tr key={receta._id}>
                <td>
                  <Badge bg="secondary">{receta.codigo || 'N/A'}</Badge>
                </td>
                <td>
                  <strong>{receta.nombre || 'Sin nombre'}</strong>
                  {receta.descripcion && (
                    <div><small className="text-muted">{receta.descripcion}</small></div>
                  )}
                  {receta.inventarioDescontado && (
                    <div><Badge bg="success" className="mt-1">✓ Inventario descontado</Badge></div>
                  )}
                </td>
                <td>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {getImageUrl(receta) ? (
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={getImageUrl(receta)} 
                          alt={receta.nombre}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            if (e && e.target && e.target.src && !e.target.src.startsWith('data:')) {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f8f9fa" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3ESin imagen%3C/text%3E%3C/svg%3E';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px'
                      }}>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Sin imagen</span>
                      </div>
                    )}
                    {onEditImage && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        style={{ 
                          position: 'absolute', 
                          bottom: '-5px', 
                          right: '-5px',
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          borderRadius: '4px'
                        }}
                        onClick={() => onEditImage(receta)}
                        title="Editar imagen"
                      >
                        📸
                      </Button>
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <Badge bg="info" className="me-1">
                      Cera {receta.cera?.porcentaje || 0}%
                    </Badge>
                  </div>
                  {receta.aditivo?.material && (
                    <div className="mt-1">
                      <Badge bg="warning" text="dark" className="me-1">
                        Aditivo {receta.aditivo?.porcentaje || 0}%
                      </Badge>
                    </div>
                  )}
                  <div className="mt-1">
                    <Badge bg="success">
                      Esencia {receta.esencia?.porcentaje || 0}%
                    </Badge>
                  </div>
                </td>
                <td>
                  {receta.frasco?.nombre || 'N/A'}
                  {receta.frasco?.capacidad && (
                    <div><small className="text-muted">{receta.frasco.capacidad}ml</small></div>
                  )}
                </td>
                <td>
                  <Badge bg="secondary">{receta.gramajeTotal || 0}g</Badge>
                </td>
                <td>
                  <Badge bg="primary">{receta.unidadesProducir || 0} uds</Badge>
                </td>
                <td>
                  <strong className="text-info">
                    {formatPrice(receta.costoPorUnidad || 0)}
                  </strong>
                  <div><small className="text-muted">por unidad</small></div>
                </td>
                <td>
                  <strong className="text-warning">
                    {formatPrice(receta.costosFijosTotales || 4750)}
                  </strong>
                  <div><small className="text-muted">por unidad</small></div>
                </td>
                <td>
                  <strong className="text-success" style={{ fontSize: '1.1em' }}>
                    {formatPrice(receta.precioVentaSugerido || 0)}
                  </strong>
                  <div><small className="text-muted">sugerido</small></div>
                </td>
                <td>
                  <div className="d-flex gap-1 flex-wrap">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => onViewDetails(receta)}
                      title="Ver detalles"
                    >
                      👁️
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => onEdit(receta)}
                      title="Editar"
                    >
                      ✏️
                    </Button>
                    {onEditImage && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onEditImage(receta)}
                        title="Editar imagen"
                      >
                        📸
                      </Button>
                    )}
                    {onToggleVisibilidad && (
                      <Button
                        variant={receta.activo ? 'success' : 'secondary'}
                        size="sm"
                        onClick={() => onToggleVisibilidad(receta._id, receta.activo)}
                        title={receta.activo ? 'Visible en Dashboard - Click para ocultar' : 'Oculta en Dashboard - Click para mostrar'}
                      >
                        {receta.activo ? '👁️' : '🚫'}
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(receta._id)}
                      title="Eliminar"
                    >
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default RecetaTable;