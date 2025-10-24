import React, { useState, useEffect } from 'react';
import { activosAPI } from '../services/api';
import GenericForm from '../components/GenericForm';
import GenericTable from '../components/GenericTable';

const Activos = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const formFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo', type: 'select', required: true, options: [
      { value: 'equipo', label: 'Equipo' },
      { value: 'herramienta', label: 'Herramienta' },
      { value: 'mueble', label: 'Mueble' },
      { value: 'tecnologia', label: 'Tecnología' },
      { value: 'otro', label: 'Otro' }
    ]},
    { name: 'valor', label: 'Valor', type: 'number', required: true, step: '0.01' },
    { name: 'fechaAdquisicion', label: 'Fecha de Adquisición', type: 'date', required: true },
    { name: 'proveedor', label: 'Proveedor', type: 'text' },
    { name: 'estado', label: 'Estado', type: 'select', required: true, options: [
      { value: 'nuevo', label: 'Nuevo' },
      { value: 'bueno', label: 'Bueno' },
      { value: 'regular', label: 'Regular' },
      { value: 'malo', label: 'Malo' },
      { value: 'obsoleto', label: 'Obsoleto' }
    ]},
    { name: 'ubicacion', label: 'Ubicación', type: 'text' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' }
  ];

  const tableColumns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo', render: (item) => (
      <span className={`badge bg-${getTipoColor(item.tipo)}`}>
        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
      </span>
    )},
    { key: 'valor', label: 'Valor', render: (item) => `$${item.valor.toLocaleString()}` },
    { key: 'estado', label: 'Estado', render: (item) => (
      <span className={`badge bg-${getEstadoColor(item.estado)}`}>
        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
      </span>
    )},
    { key: 'fechaAdquisicion', label: 'Fecha Adquisición', render: (item) => 
      new Date(item.fechaAdquisicion).toLocaleDateString()
    },
    { key: 'ubicacion', label: 'Ubicación' }
  ];

  const getTipoColor = (tipo) => {
    const colors = {
      equipo: 'primary',
      herramienta: 'success',
      mueble: 'warning',
      tecnologia: 'info',
      otro: 'secondary'
    };
    return colors[tipo] || 'secondary';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      nuevo: 'success',
      bueno: 'primary',
      regular: 'warning',
      malo: 'danger',
      obsoleto: 'dark'
    };
    return colors[estado] || 'secondary';
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await activosAPI.getAll({ activo: 'true' });
      setItems(response.data);
    } catch (err) {
      setError('Error al cargar los activos');
      console.error('Activos error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (itemData) => {
    try {
      const response = await activosAPI.create(itemData);
      setItems([response.data, ...items]);
      setShowForm(false);
    } catch (err) {
      setError('Error al crear el activo');
      console.error('Create activo error:', err);
    }
  };

  const handleUpdate = async (id, itemData) => {
    try {
      const response = await activosAPI.update(id, itemData);
      setItems(items.map(item => item._id === id ? response.data : item));
      setEditingItem(null);
    } catch (err) {
      setError('Error al actualizar el activo');
      console.error('Update activo error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este activo?')) {
      try {
        await activosAPI.delete(id);
        setItems(items.filter(item => item._id !== id));
      } catch (err) {
        setError('Error al eliminar el activo');
        console.error('Delete activo error:', err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Activos</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nuevo Activo
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <GenericTable 
        items={items}
        columns={tableColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No hay activos registrados"
      />

      {showForm && (
        <GenericForm
          item={editingItem}
          fields={formFields}
          onSubmit={editingItem ? 
            (data) => handleUpdate(editingItem._id, data) : 
            handleCreate
          }
          onClose={handleCloseForm}
          title={editingItem ? 'Editar Activo' : 'Nuevo Activo'}
        />
      )}
    </div>
  );
};

export default Activos;
