import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isEmptyObject = typeof currentUser === 'object' && currentUser !== null && Object.values(currentUser).every(v => !v);
    if (!loading && (!currentUser || isEmptyObject)) {
      navigate('/login');
    }
  }, [loading, currentUser, navigate]);

  const isEmptyObject = typeof currentUser === 'object' && currentUser !== null && Object.values(currentUser).every(v => !v);
  if (loading || !currentUser || isEmptyObject) return null;

  return children;
};

export default ProtectedRoute;
