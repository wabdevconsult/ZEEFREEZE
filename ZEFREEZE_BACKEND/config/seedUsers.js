const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = async () => {
  try {
    const existingEmails = (await User.find({}, 'email')).map(u => u.email);
    const emailsToSeed = [
      'admin@zefreez.com',
      'tech@zefreez.com', 
      'client@zefreez.com'
    ].filter(email => !existingEmails.includes(email));

    if (emailsToSeed.length === 0) {
      return console.log('✅ Tous les comptes de test existent déjà');
    }

    const users = await Promise.all(
      emailsToSeed.map(async (email) => {
        const username = email.split('@')[0];
        return {
          email,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          password: await bcrypt.hash(`${username}123`, 10),
          role: username === 'admin' ? 'admin' : 
                username === 'tech' ? 'technician' : 'client',
          createdAt: new Date()
        };
      })
    );

    await User.insertMany(users);
    console.log(`🌿 ${users.length} comptes créés :`);
    console.table(users.map(u => ({ email: u.email, role: u.role })));

  } catch (err) {
    console.error('❌ Erreur lors du seed :', err.message);
    if (err.code === 11000) {
      console.log('Astuce : Le seed a probablement déjà été exécuté');
    }
  }
};