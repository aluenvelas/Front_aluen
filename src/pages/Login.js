import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Efecto de fondo con círculos decorativos */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(205, 127, 50, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)'
      }}></div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-10 col-md-6 col-lg-5 col-xl-4">
            <Card className="shadow-lg" style={{ 
              borderRadius: '1.5rem',
              background: 'rgba(26, 26, 26, 0.95)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Card.Body className="p-3 p-sm-4 p-md-5">
                {/* Logo y título */}
                <div className="text-center mb-4">
                  <img 
                    src="/logo-aluen.svg" 
                    alt="ALUEN Logo" 
                    style={{ 
                      height: 'clamp(80px, 20vw, 120px)', 
                      width: 'clamp(80px, 20vw, 120px)',
                      marginBottom: 'clamp(10px, 3vw, 20px)',
                      filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))',
                      animation: 'pulse 3s ease-in-out infinite'
                    }} 
                  />
                  <h1 className="mb-2" style={{ 
                    color: '#d4af37',
                    fontWeight: '700',
                    letterSpacing: 'clamp(2px, 1vw, 5px)',
                    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
                  }}>
                    ALUEN
                  </h1>
                  <p style={{ 
                    color: '#b8860b',
                    fontSize: '0.95rem',
                    marginBottom: '10px',
                    letterSpacing: '1px'
                  }}>
                    Velas Artesanales
                  </p>
                  <div style={{
                    width: '60px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                    margin: '0 auto 20px'
                  }}></div>
                  <p style={{ 
                    color: '#999',
                    fontSize: '0.85rem'
                  }}>
                    Iniciar Sesion
                  </p>
                </div>

                {error && (
                  <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => setError('')}
                    style={{
                      background: 'rgba(220, 53, 69, 0.1)',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      color: '#ff6b6b'
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#d4af37', fontWeight: '500' }}>
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="email"
                      style={{
                        background: 'rgba(44, 44, 44, 0.8)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#e0e0e0',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#d4af37';
                        e.target.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: '#d4af37', fontWeight: '500' }}>
                      Contrasena
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      style={{
                        background: 'rgba(44, 44, 44, 0.8)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#e0e0e0',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#d4af37';
                        e.target.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                      border: 'none',
                      padding: '0.875rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      borderRadius: '0.5rem',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                      transition: 'all 0.3s ease',
                      color: '#1a1a1a'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Iniciando sesion...
                      </>
                    ) : (
                      'Iniciar Sesion'
                    )}
                  </Button>
                </Form>

                {/* Decoración inferior */}
                <div className="text-center mt-4">
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
                    margin: '20px 0 15px'
                  }}></div>
                  <small style={{ color: '#666', fontSize: '0.8rem' }}>
                    Sistema de Gestion
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* Footer */}
            <div className="text-center mt-4">
              <small style={{ 
                color: 'rgba(212, 175, 55, 0.6)',
                letterSpacing: '1px'
              }}>
                ALUEN &copy; 2025 - Velas Artesanales
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para animación */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.8));
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
