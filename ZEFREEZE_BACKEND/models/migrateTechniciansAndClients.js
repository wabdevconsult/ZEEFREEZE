const mongoose = require('mongoose');
const { User, Technician, Client } = require('./models');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  // Migration des techniciens
  const technicians = await Technician.find();
  for (const tech of technicians) {
    await User.findOneAndUpdate(
      { email: tech.email },
      {
        firstName: tech.firstName,
        lastName: tech.lastName,
        email: tech.email,
        phone: tech.phone,
        skills: tech.skills,
        availability: tech.availability,
        role: 'technician',
        name: `${tech.firstName} ${tech.lastName}`,
        createdAt: tech.createdAt
      },
      { upsert: true, new: true }
    );
  }

  // Migration des clients
  const clients = await Client.find();
  for (const client of clients) {
    await User.findOneAndUpdate(
      { email: client.email || `migrated-client-${client._id}@temp.com` },
      {
        name: client.name,
        email: client.email || `migrated-client-${client._id}@temp.com`,
        phone: client.phone,
        address: client.address,
        clientType: client.type,
        notes: client.notes,
        role: 'client',
        createdAt: client.createdAt
      },
      { upsert: true, new: true }
    );
  }

  console.log('Migration terminée avec succès');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Erreur de migration:', err);
  process.exit(1);
});