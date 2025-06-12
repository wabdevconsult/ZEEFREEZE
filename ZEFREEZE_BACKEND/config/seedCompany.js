const Company = require('../models/Company'); // Adjust path as needed

const seedCompany = async () => {
  try {
    const defaultCompany = {
      name: 'Zefreez',
      address: 'Paris',
      email: 'info@zefreeze.fr',
      logo: 'https://zefreeze.fr/image/logs/logo.png',
      industry: 'other',
      status: 'active'
    };

    // Check if company already exists
    const existingCompany = await Company.findOne({ name: 'Zefreez' });
    
    if (!existingCompany) {
      const company = new Company(defaultCompany);
      await company.save();
      console.log('Default company created successfully');
    } else {
      console.log('Default company already exists');
    }
  } catch (error) {
    console.error('Error seeding default company:', error);
    throw error; // Re-throw to handle in runSeed
  }
};

module.exports = seedCompany;