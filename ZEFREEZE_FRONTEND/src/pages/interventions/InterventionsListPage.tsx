import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/interventionService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';

const statusColors = {
  'en attente': 'bg-gray-100 text-gray-800',
  'confirmée': 'bg-blue-100 text-blue-800',
  'en cours': 'bg-yellow-100 text-yellow-800',
  'terminée': 'bg-green-100 text-green-800',
  'annulée': 'bg-red-100 text-red-800'
};

const urgencyColors = {
  'moins 4h': 'bg-red-100 text-red-800',
  'sous 24h': 'bg-orange-100 text-orange-800',
  'planifiée': 'bg-blue-100 text-blue-800'
};

const InterventionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: interventions, isLoading, isError } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getAll({
      ...(user?.role !== 'admin' && { clientId: user?._id })
    })
  });

  if (isLoading) return <Spinner className="mx-auto my-8" />;
  if (isError) return <div>Erreur lors du chargement des interventions</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste des interventions</h1>
        {user?.role !== 'client' && (
          <Button onClick={() => navigate('/interventions/new')}>
            Nouvelle intervention
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Équipement</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventions?.map((intervention) => (
              <TableRow key={intervention._id}>
                <TableCell>
                  {new Date(intervention.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{intervention.equipement}</TableCell>
                <TableCell>
                  {typeof intervention.client === 'object' 
                    ? intervention.client.name 
                    : 'Client inconnu'}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[intervention.status]}>
                    {intervention.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={urgencyColors[intervention.urgence]}>
                    {intervention.urgence}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/interventions/${intervention._id}`)}
                    >
                      Détails
                    </Button>
                    {(user?.role === 'admin' || user?._id === intervention.createdBy) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/interventions/${intervention._id}/edit`)}
                      >
                        Modifier
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InterventionsPage;