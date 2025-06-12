import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  ThermometerSnowflake,
  Fan,
  Wrench,
  Calendar as CalendarIcon,
  FileText,
  ArrowRight,
  User,
  Activity,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import TechnicianAvailabilityForm from "@/components/technician/TechnicianAvailabilityForm";
import api from "@/lib/axios";

interface Intervention {
  id: string;
  _id: string;
  status: string;
  priority: string;
  description: string;
  scheduled_date?: string;
  equipment?: {
    type: string;
    name: string;
  };
  company?: {
    name: string;
    address: string;
  };
  type: string;
}

interface Stats {
  todayInterventions: number;
  completedToday: number;
  activeInterventions: number;
  pendingInterventions: number;
  highPriorityInterventions: number;
  lateInterventions: number;
  maintenanceNeeded: number;
  recentlyMaintained: number;
  hoursToday: number;
  hoursWeek: number;
  successRate: number;
}

const TechnicianDashboard = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Intervention[]>([]);
  const [upcomingInterventions, setUpcomingInterventions] = useState<Intervention[]>([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    todayInterventions: 0,
    completedToday: 0,
    activeInterventions: 0,
    pendingInterventions: 0,
    highPriorityInterventions: 0,
    lateInterventions: 0,
    maintenanceNeeded: 0,
    recentlyMaintained: 0,
    hoursToday: 0,
    hoursWeek: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des données du technicien
        const [assignmentsRes, statsRes] = await Promise.all([
          api.get('/technician/assignments'),
          api.get('/technician/stats')
        ]);

        setAssignments(assignmentsRes.data);
        setStats(statsRes.data);
        
        // Filtrer les interventions à venir
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = assignmentsRes.data.filter((i: Intervention) => {
          if (!i.scheduled_date) return false;
          const scheduledDate = new Date(i.scheduled_date);
          return scheduledDate >= today && ['scheduled', 'pending'].includes(i.status);
        }).slice(0, 3);

        setUpcomingInterventions(upcoming);
      } catch (error) {
        console.error('Error fetching technician data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user?.id) return;

      try {
        const response = await api.get(`/messages/unread-count?recipientId=${user.id}`);
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    fetchUnreadMessages();
  }, [user?.id]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/interventions/${id}/status`, { status });
      setAssignments(prev => 
        prev.map(a => a._id === id ? { ...a, status } : a)
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'cold_storage': 
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc': 
        return <Fan className="h-5 w-5 text-green-500" />;
      default: 
        return <Wrench className="h-5 w-5 text-purple-500" />;
    }
  };

  const renderStatusBadge = (status: string): string => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'scheduled': return 'Planifiée';
      default: return 'En cours';
    }
  };

  const renderPriorityBadge = (priority: string): string => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      default: return 'Basse';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Planning Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Planning du jour</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Interventions planifiées</span>
                <span className="font-semibold">{isLoading ? '...' : stats.todayInterventions}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Terminées aujourd'hui</span>
                <span className="font-semibold">{isLoading ? '...' : stats.completedToday}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Interventions Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Interventions actives</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">En cours</span>
                <span className="font-semibold">{isLoading ? '...' : stats.activeInterventions}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">En attente</span>
                <span className="font-semibold">{isLoading ? '...' : stats.pendingInterventions}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Urgences Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold">Urgences</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Priorité haute</span>
                <span className="font-semibold text-red-500">{isLoading ? '...' : stats.highPriorityInterventions}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">En retard</span>
                <span className="font-semibold text-orange-500">{isLoading ? '...' : stats.lateInterventions}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Équipements Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">État des équipements</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Maintenance nécessaire</span>
                <span className="font-semibold">{isLoading ? '...' : stats.maintenanceNeeded}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Récemment entretenus</span>
                <span className="font-semibold">{isLoading ? '...' : stats.recentlyMaintained}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Temps Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold">Suivi du temps</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Heures aujourd'hui</span>
                <span className="font-semibold">{isLoading ? '...' : stats.hoursToday}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Total semaine</span>
                <span className="font-semibold">{isLoading ? '...' : stats.hoursWeek}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Réalisation Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold">Taux de réalisation</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Cette semaine</span>
                <span className="font-semibold">{isLoading ? '...' : stats.successRate}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-teal-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Disponibilités */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gestion des disponibilités</h2>
          <button
            onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAvailabilityForm ? 'Masquer le formulaire' : 'Définir mes disponibilités'}
          </button>
        </div>

        {showAvailabilityForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <TechnicianAvailabilityForm />
          </div>
        )}
      </div>

      {/* Interventions à venir */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Mes prochaines interventions</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : upcomingInterventions.length > 0 ? (
            <div className="space-y-4">
              {upcomingInterventions.map((intervention) => (
                <div 
                  key={intervention.id}
                  className={`p-4 rounded-lg ${
                    intervention.status === 'pending' ? 'bg-yellow-50 border border-yellow-100' :
                    intervention.status === 'scheduled' ? 'bg-blue-50 border border-blue-100' :
                    'bg-green-50 border border-green-100'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {getTypeIcon(intervention.equipment?.type || intervention.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {intervention.description.length > 50 
                            ? `${intervention.description.substring(0, 50)}...` 
                            : intervention.description}
                        </h4>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(intervention.status)}`}>
                            {renderStatusBadge(intervention.status)}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(intervention.priority)}`}>
                            {renderPriorityBadge(intervention.priority)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>
                          {intervention.scheduled_date 
                            ? format(new Date(intervention.scheduled_date), 'EEEE dd MMMM yyyy', { locale: fr })
                            : 'Date non planifiée'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        <span>{intervention.company?.name || 'Client non spécifié'}</span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{intervention.company?.address || 'Adresse non spécifiée'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link 
                      to={`/dashboard/interventions/${intervention.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      Voir détails
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune intervention planifiée
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link 
              to="/dashboard/interventions"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Voir toutes mes interventions
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Mes statistiques</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Taux de réussite</span>
                <span className="text-sm font-medium">{stats.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.successRate}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Temps moyen d'intervention</span>
                <span className="text-sm font-medium">1h 45min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Satisfaction client</span>
                <span className="text-sm font-medium">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Rappels importants</h3>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Maintenance préventive</p>
                <p className="text-xs text-yellow-700">N'oubliez pas de vérifier les filtres lors des maintenances VMC</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
              <CalendarIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Formation HACCP</p>
                <p className="text-xs text-blue-700">Formation prévue le 25/05/2025 à 9h00</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
              <FileText className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Rapports en attente</p>
                <p className="text-xs text-green-700">2 rapports d'intervention à compléter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;