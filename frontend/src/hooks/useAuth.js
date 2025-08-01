import { useState, useEffect } from 'react';
import { authService } from '../api/api';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    navigate(userData.isDriver ? '/driver' : '/passenger');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}