import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'technician' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      // Cas 1: Utilisateur non connecté
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      // Cas 2: Route sans restriction de rôle
      if (!requiredRole) {
        setIsAuthorized(true);
        return;
      }

      // Cas 3: Vérification des rôles
      const hasAccess = 
        user.role === requiredRole || // L'utilisateur a le rôle requis
        user.role === 'admin';        // Ou c'est un admin (qui a tous les accès)

      if (!hasAccess) {
        const roleNames = {
          admin: 'administrateur',
          technician: 'technicien',
          client: 'client'
        };
        toast.error(`Accès restreint. Rôle ${roleNames[requiredRole]} requis.`);
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, isLoading, requiredRole]);

  // États de chargement
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirections
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Accès autorisé
  return <>{children}</>;
};

export default ProtectedRoute;