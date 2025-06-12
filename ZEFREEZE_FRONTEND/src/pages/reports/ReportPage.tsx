import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Download, ThermometerSnowflake, Camera, CheckCircle, XCircle,
  AlertTriangle, Edit, ArrowLeft, Save, Trash2, ClipboardCheck
} from 'lucide-react';

import { useReports } from '../../hooks/useReports';
import SignatureCanvas from '../../components/reports/SignatureCanvas';
import ReportPhotoUploader from '../../components/reports/ReportPhotoUploader';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getReport,
    downloadReportPdf,
    updateReport,
    addPhotos,
    signReport
  } = useReports();

  const { data: report, isLoading } = getReport(id || '');

  const [isSigningMode, setIsSigningMode] = useState(false);
  const [technicianSignature, setTechnicianSignature] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (!id) return;
    downloadReportPdf.mutate(id);
  };

  const handleSignReport = async () => {
    if (!id || !technicianSignature || !clientSignature) {
      toast.error('Les deux signatures sont requises');
      return;
    }
    try {
      await signReport.mutateAsync({
        reportId: id,
        technicianSignature,
        clientSignature
      });
      toast.success('Rapport signé avec succès');
      setIsSigningMode(false);
    } catch (error) {
      console.error('Erreur signature :', error);
      toast.error('Impossible de signer le rapport');
    }
  };

  const handleAddPhotos = async () => {
    if (!id || newPhotos.length === 0) {
      toast.error('Sélectionnez au moins une photo');
      return;
    }
    try {
      await addPhotos.mutateAsync({ reportId: id, photos: newPhotos });
      toast.success('Photos ajoutées');
      setNewPhotos([]);
      setIsAddingPhotos(false);
    } catch (error) {
      console.error('Erreur photo :', error);
      toast.error('Erreur lors de l’ajout des photos');
    }
  };

const handleDelete = async () => {
  if (!id) return; // Si pas d'ID, on ne fait rien
  const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?");
  if (!confirmed) return; // Si l'utilisateur annule, on sort

  setIsDeleting(true); // Indique que la suppression est en cours (ex : pour désactiver un bouton)
  try {
    // Appelle le backend via React Query pour marquer comme supprimé
    await updateReport.mutateAsync({ reportId: id, delete: true });

    toast.success("Rapport supprimé"); // Message de succès
    navigate("/dashboard/reports"); // Redirection
  } catch (error) {
    console.error("Erreur suppression :", error); // Log technique
    toast.error("Échec de la suppression"); // Message à l'utilisateur
  } finally {
    setIsDeleting(false); // Réactive l’interface même si erreur
  }
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Rapport non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/reports')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rapport {report.type === 'intervention' ? "d’intervention" : report.type === 'haccp' ? 'HACCP' : 'de maintenance'}
            </h1>
            <p className="text-gray-600">
              {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isSigningMode && !isAddingPhotos && (
            <>
              <Link to="/dashboard/reports/haccp" className="btn-default">
                <ClipboardCheck className="h-4 w-4 mr-2" /> Formulaire HACCP
              </Link>
              <button onClick={() => setIsAddingPhotos(true)} className="btn-default">
                <Camera className="h-4 w-4 mr-2" /> Ajouter des photos
              </button>
              <button onClick={() => setIsSigningMode(true)} className="btn-default">
                <Edit className="h-4 w-4 mr-2" /> Signer le rapport
              </button>
              <Link to={`/dashboard/reports/${id}/edit`} className="btn-default">
                <Edit className="h-4 w-4 mr-2" /> Modifier
              </Link>
              <button onClick={handleDelete} disabled={isDeleting} className="btn-danger">
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </button>
              <button onClick={handleDownload} className="btn-primary">
                <Download className="h-4 w-4 mr-2" /> Télécharger PDF
              </button>
            </>
          )}

          {isSigningMode && (
            <>
              <button onClick={() => setIsSigningMode(false)} className="btn-default">
                <XCircle className="h-4 w-4 mr-2" /> Annuler
              </button>
              <button onClick={handleSignReport} className="btn-primary">
                <Save className="h-4 w-4 mr-2" /> Enregistrer les signatures
              </button>
            </>
          )}

          {isAddingPhotos && (
            <>
              <button onClick={() => setIsAddingPhotos(false)} className="btn-default">
                <XCircle className="h-4 w-4 mr-2" /> Annuler
              </button>
              <button onClick={handleAddPhotos} className="btn-primary">
                <Save className="h-4 w-4 mr-2" /> Enregistrer les photos
              </button>
            </>
          )}
        </div>
      </div>

      {isSigningMode ? (
        <div className="card">
          <div className="card-header">Signature du rapport</div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignatureCanvas label="Signature du technicien" onSignatureChange={setTechnicianSignature} />
            <SignatureCanvas label="Signature du client" onSignatureChange={setClientSignature} />
          </div>
        </div>
      ) : isAddingPhotos ? (
        <div className="card">
          <div className="card-header">Ajouter des photos</div>
          <div className="card-body">
            <ReportPhotoUploader existingPhotos={report.photos} onPhotosSelected={setNewPhotos} />
          </div>
        </div>
      ) : (
        <div className="card">
          {/* Ici tu peux coller le reste de ta structure HTML (conformité, photos, notes, signatures, etc.) */}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
