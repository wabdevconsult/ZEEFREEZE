const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = async () => {
  try {
    const existingEmails = (await User.find({}, 'email')).map(u => u.email);
    
    const seedData = [
      {
        email: 'bak.abdrrahman@gmail.com',
        name: 'Abdrrahman',
        role: 'admin',
        password: 'super@admin',
      },
      {
        email: 'tech@zefreez.com',
        name: 'Tech',
        role: 'technician',
        password: 'super@admin',
      },
      {
        email: 'client@zefreez.com',
        name: 'Client',
        role: 'client',
        password: 'super@admin',
      }
    ];

    const usersToInsert = await Promise.all(
      seedData
        .filter(user => !existingEmails.includes(user.email))
        .map(async user => ({
          email: user.email,
          name: user.name,
          password: await bcrypt.hash(user.password, 10),
          role: user.role,
          createdAt: new Date()
        }))
    );

    if (usersToInsert.length === 0) {
      return console.log('✅ Tous les comptes de test existent déjà');
    }

    await User.insertMany(usersToInsert);
    console.log(`🌿 ${usersToInsert.length} comptes créés :`);
    console.table(usersToInsert.map(u => ({ email: u.email, role: u.role })));

  } catch (err) {
    console.error('❌ Erreur lors du seed :', err.message);
    if (err.code === 11000) {
      console.log('Astuce : Le seed a probablement déjà été exécuté');
    }
  }
};
