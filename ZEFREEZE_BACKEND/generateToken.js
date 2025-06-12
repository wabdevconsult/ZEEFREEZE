// generateToken.js
const jwt = require('jsonwebtoken');

const secret = 'K3y!@ZeeFReeZ_2025#Xy7_Lwab^SecureToken'; // correspond à ton .env
const userId = '6831a64192a77799163aefaf'; // ton vrai user MongoDB _id

const token = jwt.sign({ id: userId }, secret, { expiresIn: '7d' });

console.log('\n🎯 TOKEN DE TEST À COPIER :\n');
console.log(token);
