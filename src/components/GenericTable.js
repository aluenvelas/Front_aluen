import React from 'react';
import { Table, Button } from 'react-bootstrap';

const GenericTable = ({ items, columns, onEdit, onDelete, emptyMessage = "No hay elementos registrados" }) => {
  if (items.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <h5 className="text-muted">{emptyMessage}</h5>
          <p className="text-muted">Comienza agregando tu primer elemento</p>
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
                {columns.map(column => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {columns.map(column => (
                    <td key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  <td>
                    <div className="btn-group" role="group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(item)}
                        title="Editar"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(item._id)}
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

export default GenericTable;
