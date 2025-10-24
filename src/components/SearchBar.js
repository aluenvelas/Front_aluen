import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Buscar..." }) => {
  return (
    <InputGroup className="mb-3">
      <InputGroup.Text>
        🔍
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          borderLeft: 'none',
          fontSize: '0.95rem'
        }}
      />
      {searchTerm && (
        <InputGroup.Text 
          onClick={() => onSearchChange('')}
          style={{ 
            cursor: 'pointer',
            backgroundColor: '#f8f9fa',
            borderLeft: 'none'
          }}
          title="Limpiar búsqueda"
        >
          ✕
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};

export default SearchBar;

