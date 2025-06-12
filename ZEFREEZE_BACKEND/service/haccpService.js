// backendZ/service/haccpService.js
const { getNotification } = require('../utils/modelRegistry');
const { Notification } = require('../utils/modelRegistry');

async function generateHACCPReport(intervention) {
  try {
    // Votre logique existante de génération de rapport
    
    // Exemple de création de notification
    await Notification.create({
      user: intervention.client,
      type: 'HACCP_REPORT',
      data: {
        interventionId: intervention._id,
        message: `Rapport HACCP généré pour l'intervention ${intervention._id}`
      },
      read: false
    });

    console.log('Rapport HACCP généré avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération du rapport HACCP:', error);
    throw error;
  }
}

module.exports = { generateHACCPReport };