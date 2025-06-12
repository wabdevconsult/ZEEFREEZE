const Company = require('../models/Company');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Intervention = require('../models/Intervention');
const { NotFoundError, BadRequestError } = require('../errors');

exports.getAllCompanies = async (req, res) => {
  try {
    const { search, status, industry } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (industry) query.industry = industry;

    const companies = await Company.find(query)
      .sort({ name: 1 })
      .select('-__v')
      .lean();

    const companiesWithStats = await Promise.all(companies.map(async company => {
      const [equipmentCount, userCount, interventionCount] = await Promise.all([
        Equipment.countDocuments({ companyId: company._id }),
        User.countDocuments({ companyId: company._id }),
        Intervention.countDocuments({ companyId: company._id })
      ]);

      const lastIntervention = await Intervention.findOne({ companyId: company._id })
        .sort({ createdAt: -1 })
        .select('createdAt')
        .lean();

      return {
        ...company,
        equipmentCount,
        userCount,
        interventionCount,
        lastIntervention: lastIntervention?.createdAt || null
      };
    }));

    res.status(200).json({
      success: true,
      data: companiesWithStats,
      count: companiesWithStats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des entreprises'
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Entreprise non trouvée'
      });
    }

    const [equipment, users, interventions] = await Promise.all([
      Equipment.find({ companyId: company._id })
        .select('name type status lastMaintenanceDate')
        .sort({ name: 1 })
        .lean(),
      User.find({ companyId: company._id })
        .select('name role email')
        .sort({ name: 1 })
        .lean(),
      Intervention.find({ companyId: company._id })
        .select('type status createdAt technician')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const stats = {
      equipmentCount: equipment.length,
      userCount: users.length,
      interventionCount: interventions.length
    };

    const formattedEquipment = equipment.map(item => ({
      id: item._id,
      name: item.name,
      type: item.type,
      status: item.status,
      lastMaintenance: item.lastMaintenanceDate || new Date().toISOString()
    }));

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    }));

    const formattedInterventions = interventions.map(intervention => ({
      id: intervention._id,
      type: intervention.type,
      status: intervention.status,
      date: intervention.createdAt,
      technician: intervention.technician?.name || 'Technicien'
    }));

    res.status(200).json({
      success: true,
      data: {
        ...company,
        stats,
        equipment: formattedEquipment,
        users: formattedUsers,
        interventions: formattedInterventions
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Entreprise non trouvée'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l entreprise'
    });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, address, phone, email, industry } = req.body;
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        error: 'Une entreprise avec ce nom existe déjà'
      });
    }

    const company = new Company({
      name,
      address,
      phone,
      email,
      industry,
      createdBy: req.user._id
    });

    await company.save();

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l entreprise'
    });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.createdAt;
    delete updateData.createdBy;

    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Entreprise non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l entreprise'
    });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Entreprise non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l entreprise'
    });
  }
};

exports.importCompanies = async (req, res) => {
  try {
    const companiesData = req.body;

    if (!Array.isArray(companiesData)) {
      return res.status(400).json({
        success: false,
        error: 'Les données doivent être un tableau d entreprises'
      });
    }

    const validationErrors = [];
    const validCompanies = [];

    for (const companyData of companiesData) {
      try {
        const company = new Company(companyData);
        await company.validate();
        validCompanies.push(companyData);
      } catch (error) {
        validationErrors.push({
          data: companyData,
          error: error.message
        });
      }
    }

    if (validationErrors.length > 0 && validCompanies.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Toutes les entreprises ont des erreurs de validation',
        details: validationErrors
      });
    }

    const result = await Company.insertMany(validCompanies, { ordered: false });

    res.status(201).json({
      success: true,
      data: {
        importedCount: result.length,
        totalCount: companiesData.length,
        errors: validationErrors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de limport des entreprises'
    });
  }
};

exports.getCompanyStats = async (req, res) => {
  try {
    const stats = await Company.aggregate([
      {
        $group: {
          _id: null,
          totalCompanies: { $sum: 1 },
          activeCompanies: { 
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          byIndustry: { $push: '$industry' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCompanies: 1,
          activeCompanies: 1,
          industries: {
            $reduce: {
              input: '$byIndustry',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  { $cond: [{ $in: ['$$this', '$$value'] }, [], ['$$this']] }
                ]
              }
            }
          }
        }
      }
    ]);

    const industryStats = await Company.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...stats[0],
        industryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};