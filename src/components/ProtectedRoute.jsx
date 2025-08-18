import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!currentUser || (typeof currentUser === 'object' && Object.keys(currentUser || {}).length === 0))) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  if (loading || !currentUser) return null;

  return children;
};

export default ProtectedRoute;
