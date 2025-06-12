const fs = require('fs');
const path = require('path');

// Utilise le même dossier logs que authLogger
const LOG_DIR = path.join(__dirname, '../../logs');
const ACTION_LOG = path.join(LOG_DIR, 'actions.log');

exports.logAction = (userId, action, details = {}) => {
  try {
    // Crée le fichier si nécessaire (sans dossier séparé)
    if (!fs.existsSync(ACTION_LOG)) {
      fs.writeFileSync(ACTION_LOG, '');
    }
    
    const logEntry = `[${new Date().toISOString()}] ${userId} - ${action} - ${JSON.stringify(details)}\n`;
    fs.appendFileSync(ACTION_LOG, logEntry);
    
  } catch (err) {
    console.error('❌ Erreur de log d\'action:', err);
    // Fallback minimal
    console.log('ACTION FALLBACK:', userId, action, details);
  }
};