import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Dropzone from 'react-dropzone';
import { useInterventions } from '@/hooks/useInterventions';
import { EquipementType, UrgenceType, EnergieType } from '@/types/intervention';

const InterventionNewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createIntervention, uploadPhotos, isCreating } = useInterventions();
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue 
  } = useForm({
    defaultValues: {
      equipement: '' as EquipementType,
      urgence: 'planifiée' as UrgenceType,
      description: '',
      energie: '' as EnergieType,
      conforme_HACCP: false,
      client: user?.role === 'client' ? user._id : ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // First create the intervention
      const intervention = await createIntervention(data);
      
      // Then upload photos if any
      if (files.length > 0) {
        await uploadPhotos({ id: intervention._id, files });
      }

      navigate('/interventions');
    } catch (error) {
      console.error('Error creating intervention:', error);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length + files.length > 3) {
      toast.error('Maximum 3 photos autorisées');
      return;
    }

    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);

    // Create previews
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const selectedEquipement = watch('equipement');
  const selectedUrgence = watch('urgence');

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/interventions')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Intervention</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client field (only for admin) */}
            {user?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <input
                  type="text"
                  {...register('client', { required: 'Ce champ est requis' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.client && (
                  <p className="mt-1 text-sm text-red-600">{errors.client.message}</p>
                )}
              </div>
            )}

            {/* Equipment field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Équipement</label>
              <select
                {...register('equipement', { required: 'Ce champ est requis' })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  selectedEquipement ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <option value="">Sélectionnez un équipement</option>
                <option value="chambre froide positive">Chambre froide positive</option>
                <option value="chambre froide négative">Chambre froide négative</option>
                <option value="meuble réfrigéré">Meuble réfrigéré</option>
                <option value="centrale frigorifique">Centrale frigorifique</option>
                <option value="VMC">VMC</option>
              </select>
              {errors.equipement && (
                <p className="mt-1 text-sm text-red-600">{errors.equipement.message}</p>
              )}
            </div>

            {/* Urgency field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau d'urgence</label>
              <select
                {...register('urgence')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  selectedUrgence ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <option value="planifiée">Planifiée</option>
                <option value="sous 24h">Sous 24h</option>
                <option value="moins 4h">Moins de 4h (urgence)</option>
              </select>
            </div>

            {/* Energy field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Type d'énergie</label>
              <select
                {...register('energie')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Non spécifié</option>
                <option value="électricité">Électricité</option>
                <option value="gaz">Gaz</option>
                <option value="fluides">Fluides frigorigènes</option>
              </select>
            </div>
          </div>

          {/* Description field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description de la panne</label>
            <textarea
              {...register('description', { required: 'Ce champ est requis' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Décrivez en détail la panne ou le problème rencontré..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Photos (max 3)</label>
            <Dropzone 
              onDrop={onDrop} 
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }} 
              maxFiles={3}
              maxSize={5 * 1024 * 1024} // 5MB
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                >
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500">
                        <Upload className="h-5 w-5 mx-auto" />
                        <input {...getInputProps()} />
                        <p className="pl-1">Glissez-déposez des fichiers ou cliquez pour sélectionner</p>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG jusqu'à 5MB</p>
                  </div>
                </div>
              )}
            </Dropzone>

            {/* Preview images */}
            {previewImages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HACCP compliance */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="haccp"
              {...register('conforme_HACCP')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="haccp" className="ml-2 block text-sm text-gray-900">
              Conforme aux normes HACCP
            </label>
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/interventions')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Création en cours...' : 'Créer l\'intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterventionNewPage;