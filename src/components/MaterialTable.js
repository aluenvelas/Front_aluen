import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

const MaterialTable = ({ materiales, onEdit, onDelete }) => {
  const getTipoBadge = (tipo) => {
    const colors = {
      cera: 'primary',
      aditivo: 'success',
      esencia: 'warning',
      otro: 'secondary'
    };
    return (
      <Badge bg={colors[tipo] || 'secondary'}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(1)}`;
  };

  if (materiales.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5 className="text-muted">No hay materiales registrados</h5>
          <p className="text-muted">Comienza agregando tu primer material</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio/Gramo</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Unidad</th>
                <th>Valor Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((material) => (
                <tr key={material._id}>
                  <td>
                    <div>
                      <strong>{material.nombre}</strong>
                      {material.descripcion && (
                        <div className="text-muted small">
                          {material.descripcion}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{getTipoBadge(material.tipo)}</td>
                  <td>{formatPrice(material.precioPorGramo)}</td>
                  <td>{material.proveedor}</td>
                  <td>
                    <span className={material.stock > 0 ? 'text-success' : 'text-warning'}>
                      {material.stock.toFixed(1)} {material.unidad}
                    </span>
                  </td>
                  <td>
                    <Badge bg="info">{material.unidad}</Badge>
                  </td>
                  <td>
                    <strong>{formatPrice(material.stock * material.precioPorGramo)}</strong>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(material)}
                        title="Editar"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(material._id)}
                        title="Eliminar"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MaterialTable;
