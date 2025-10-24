import React, { useState, useEffect } from 'react';
import { frascosAPI } from '../services/api';
import GenericForm from '../components/GenericForm';
import GenericTable from '../components/GenericTable';

const Frascos = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const formFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'capacidad', label: 'Capacidad', type: 'number', required: true, step: '0.1' },
    { name: 'unidad', label: 'Unidad', type: 'select', required: true, options: [
      { value: 'ml', label: 'Mililitros' },
      { value: 'gramos', label: 'Gramos' }
    ]},
    { name: 'material', label: 'Material', type: 'text', required: true },
    { name: 'precio', label: 'Precio', type: 'number', required: true, step: '0.01' },
    { name: 'proveedor', label: 'Proveedor', type: 'text', required: true },
    { name: 'stock', label: 'Stock', type: 'number', required: true, step: '1' },
    { name: 'imagenUrl', label: 'URL de Imagen (Google Drive)', type: 'url', placeholder: 'https://drive.google.com/file/d/...' },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' }
  ];

  const tableColumns = [
    { key: 'imagen', label: 'Imagen', render: (item) => {
      if (item.imagenUrl) {
        // Extraer ID de diferentes formatos de URL de Google Drive
        let imageUrl = item.imagenUrl;
        
        // Formato 1: https://drive.google.com/file/d/ID/view?usp=sharing
        const match1 = item.imagenUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        
        // Formato 2: https://drive.google.com/open?id=ID
        const match2 = item.imagenUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        
        const fileId = match1 ? match1[1] : (match2 ? match2[1] : null);
        
        if (fileId) {
          // Usar URL alternativa de Google que funciona mejor
          imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        }
        
        // Usar proxy del backend para evitar CORS
        const API_URL = process.env.REACT_APP_API_URL || 'https://back-aluen-ohbk.onrender.com/api';
        const baseURL = API_URL.replace('/api', ''); // Remover /api del final
        const proxyUrl = `${baseURL}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        
        return (
          <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <img 
              src={proxyUrl} 
              alt={item.nombre}
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
              loading="lazy"
              onError={(e) => {
                if (e && e.target && e.target.src && !e.target.src.startsWith('data:')) {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23f8d7da" width="50" height="50"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23721c24" font-size="8"%3E%E2%9D%8C%3C/text%3E%3C/svg%3E';
                }
              }}
            />
          </div>
        );
      }
      return <span className="text-muted">Sin imagen</span>;
    }},
    { key: 'nombre', label: 'Nombre' },
    { key: 'capacidad', label: 'Capacidad', render: (item) => `${item.capacidad} ${item.unidad}` },
    { key: 'material', label: 'Material' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'stock', label: 'Stock', render: (item) => `${item.stock} unidades` },
    { key: 'precio', label: 'Precio', render: (item) => `$${item.precio.toFixed(2)}` }
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await frascosAPI.getAll({ activo: 'true' });
      setItems(response.data);
    } catch (err) {
      setError('Error al cargar los frascos');
      console.error('Frascos error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (itemData) => {
    try {
      const response = await frascosAPI.create(itemData);
      setItems([response.data, ...items]);
      setShowForm(false);
    } catch (err) {
      setError('Error al crear el frasco');
      console.error('Create frasco error:', err);
    }
  };

  const handleUpdate = async (id, itemData) => {
    try {
      const response = await frascosAPI.update(id, itemData);
      setItems(items.map(item => item._id === id ? response.data : item));
      setEditingItem(null);
    } catch (err) {
      setError('Error al actualizar el frasco');
      console.error('Update frasco error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este frasco?')) {
      try {
        await frascosAPI.delete(id);
        setItems(items.filter(item => item._id !== id));
      } catch (err) {
        setError('Error al eliminar el frasco');
        console.error('Delete frasco error:', err);
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
        <h1 className="h3 mb-0">Frascos</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nuevo Frasco
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
        emptyMessage="No hay frascos registrados"
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
          title={editingItem ? 'Editar Frasco' : 'Nuevo Frasco'}
        />
      )}
    </div>
  );
};

export default Frascos;
