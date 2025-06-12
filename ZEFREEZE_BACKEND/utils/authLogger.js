const fs = require('fs');
const path = require('path');

// Chemin relatif vers les logs (depuis l'emplacement actuel du fichier)
const LOG_DIR = path.join(__dirname, '../../logs');
const AUTH_LOG = path.join(LOG_DIR, 'auth.log');

// Création synchrone du dossier au premier appel
let logsInitialized = false;
function initLogs() {
  if (!logsInitialized) {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    logsInitialized = true;
  }
}

exports.logAuthAttempt = (email, success, ip) => {
  try {
    initLogs(); // S'assure que le dossier existe
    
    const logEntry = `[${new Date().toISOString()}] ${success ? 'SUCCESS' : 'FAILURE'} - Email: ${email} - IP: ${ip}\n`;
    
    fs.appendFileSync(AUTH_LOG, logEntry); // Version synchrone pour plus de fiabilité
    
    // Debug en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Auth log:', logEntry.trim());
    }
  } catch (err) {
    console.error('❌ Erreur critique de log:', err);
    // Fallback absolu
    process.stdout.write(`FALLBACK LOG: ${email} ${ip} ${success}\n`);
  }
};