import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'client';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/auth/me', {
          validateStatus: (status) => status < 500
        });
        
        if (data?.user) {
          setUser(data.user);
          setError(null);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        setUser(null);
        if (error.response?.status !== 401) {
          setError('Erreur de connexion au serveur');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!['/login', '/register'].includes(window.location.pathname)) {
      verifyAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('token', data.token); // Stocker le token
      
      const redirectPath = data.user.role === 'admin' ? '/dashboard/admin' :
                          data.user.role === 'technician' ? '/dashboard/technician' :
                          '/dashboard/client';
      
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                         'Échec de la connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setUser(data.user);
      localStorage.setItem('token', data.token); // Stocker le token
      
      const redirectPath = data.user.role === 'admin' ? '/dashboard/admin' :
                         data.user.role === 'technician' ? '/dashboard/technician' :
                         '/dashboard/client';
      
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                         'Échec de l\'inscription';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('token'); // Supprimer le token
      navigate('/login'); // Correction du chemin avec slash initial
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};