import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { interventionService } from '@/services/interventionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useInterventions } from '@/hooks/useInterventions';

const statusOptions = [
  { value: 'en attente', label: 'En attente' },
  { value: 'confirmée', label: 'Confirmée' },
  { value: 'en cours', label: 'En cours' },
  { value: 'terminée', label: 'Terminée' },
  { value: 'annulée', label: 'Annulée' }
];

const InterventionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateStatus, isUpdatingStatus } = useInterventions();

  const { data: intervention, isLoading, isError } = useQuery({
    queryKey: ['intervention', id],
    queryFn: () => interventionService.getById(id!)
  });

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ id: id!, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (isLoading) return <Spinner className="mx-auto my-8" />;
  if (isError || !intervention) return <div>Intervention non trouvée</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/interventions')}
          className="mb-4"
        >
          ← Retour à la liste
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Détails de l'intervention</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Équipement</p>
                <p className="font-medium">{intervention.equipement}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{intervention.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="font-medium">
                  {new Date(intervention.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Statut et urgence</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <div className="flex items-center space-x-2">
                  <Badge className={`${statusColors[intervention.status]} capitalize`}>
                    {intervention.status}
                  </Badge>
                  {(user?.role === 'admin' || user?.role === 'technician') && (
                    <select
                      value={intervention.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="border rounded p-1 text-sm"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Niveau d'urgence</p>
                <Badge className={`${urgencyColors[intervention.urgence]} capitalize`}>
                  {intervention.urgence}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type d'énergie</p>
                <p className="font-medium">{intervention.energie || 'Non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Conformité HACCP</p>
                <p className="font-medium">
                  {intervention.conforme_HACCP ? 'Conforme' : 'Non conforme'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photos section */}
        {intervention.photos.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {intervention.photos.map((photo, index) => (
                <div key={index} className="rounded-md overflow-hidden border">
                  <img 
                    src={photo} 
                    alt={`Intervention photo ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {(user?.role === 'admin' || user?._id === intervention.createdBy) && (
            <Button
              variant="outline"
              onClick={() => navigate(`/interventions/${intervention._id}/edit`)}
            >
              Modifier
            </Button>
          )}
          <Button onClick={() => navigate('/interventions')}>
            Retour à la liste
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterventionDetailPage;