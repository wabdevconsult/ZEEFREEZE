const Equipment = require('../models/Equipment');
const Company = require('../models/Company');
const { 
  NotFoundError, 
  BadRequestError,
  ForbiddenError
} = require('../errors');
const mongoose = require('mongoose');
const { logAction } = require('../utils/actionLogger');

class EquipmentController {
  constructor() {
    // Liaison explicite de toutes les méthodes
    const methods = [
      'getAllEquipment',
      'getEquipmentById',
      'createEquipment',
      'updateEquipment',
      'deleteEquipment',
      'updateEquipmentStatus',
      'addMaintenanceRecord',
      'getMaintenanceSchedule',
      'validateEquipmentAccess',
      'validateSerialNumberUniqueness',
      'buildEquipmentQuery',
      'handleError'
    ];

    methods.forEach(method => {
      if (typeof this[method] === 'function') {
        this[method] = this[method].bind(this);
      } else {
        console.error(`Method ${method} is not defined in EquipmentController`);
        process.exit(1);
      }
    });
  }

  // Méthode getAllEquipment
  async getAllEquipment(req, res) {
    try {
      const { page = 1, limit = 10, search, status, type } = req.query;
      const query = { companyId: req.user.companyId };

      if (status) query.status = status;
      if (type) query.type = type;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { serialNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const [equipment, total] = await Promise.all([
        Equipment.find(query)
          .sort({ name: 1 })
          .skip((page - 1) * limit)
          .limit(Number(limit)),
        Equipment.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: equipment,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode getEquipmentById
  async getEquipmentById(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const equipment = await Equipment.findOne({
        _id: req.params.id,
        companyId: req.user.companyId
      });

      if (!equipment) {
        throw new NotFoundError('Equipment not found');
      }

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode createEquipment
  async createEquipment(req, res) {
    try {
      const { name, type, brand, model, serialNumber, installationDate, locationId, specifications } = req.body;
      
      if (!name || !type || !brand || !model || !serialNumber || !installationDate || !locationId) {
        throw new BadRequestError('Missing required fields');
      }

      await this.validateSerialNumberUniqueness(serialNumber, req.user.companyId);
      
      const equipment = await Equipment.create({
        name,
        type,
        brand,
        model,
        serialNumber,
        installationDate,
        location: {
          _id: locationId,
          name: req.body.locationName || 'Unknown Location'
        },
        specifications: specifications || {
          temperature: { min: 0, max: 0 },
          power: 0,
          dimensions: { width: 0, height: 0, depth: 0 }
        },
        status: 'operational',
        companyId: req.user.companyId,
        createdBy: req.user._id,
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
      });

      await logAction(
        req.user._id,
        'EQUIPMENT_CREATE',
        { id: equipment._id, name: equipment.name }
      );

      res.status(201).json({
        success: true,
        data: equipment
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode updateEquipment
  async updateEquipment(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      if (updates.serialNumber) {
        await this.validateSerialNumberUniqueness(updates.serialNumber, req.user.companyId, id);
      }

      const equipment = await Equipment.findByIdAndUpdate(
        id,
        { ...updates, updatedBy: req.user._id },
        { new: true, runValidators: true }
      );

      if (!equipment) {
        throw new NotFoundError('Equipment not found');
      }

      await logAction(req.user._id, 'EQUIPMENT_UPDATE', { id: equipment._id });

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode deleteEquipment
  async deleteEquipment(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const equipment = await Equipment.findByIdAndDelete(id);

      if (!equipment) {
        throw new NotFoundError('Equipment not found');
      }

      await logAction(req.user._id, 'EQUIPMENT_DELETE', { id: equipment._id });

      res.json({
        success: true,
        data: { message: 'Equipment deleted successfully' }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode updateEquipmentStatus
  async updateEquipmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const validStatuses = ['operational', 'maintenance_needed', 'out_of_service'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const equipment = await Equipment.findByIdAndUpdate(
        id,
        { status, updatedBy: req.user._id },
        { new: true }
      );

      if (!equipment) {
        throw new NotFoundError('Equipment not found');
      }

      await logAction(req.user._id, 'EQUIPMENT_STATUS_UPDATE', { 
        id: equipment._id, 
        status 
      });

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode addMaintenanceRecord
  async addMaintenanceRecord(req, res) {
    try {
      const { id } = req.params;
      const { description, date } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid ID format');
      }

      const equipment = await Equipment.findByIdAndUpdate(
        id,
        {
          $push: {
            maintenanceRecords: {
              description,
              date: date || new Date(),
              performedBy: req.user._id
            }
          }
        },
        { new: true }
      );

      if (!equipment) {
        throw new NotFoundError('Equipment not found');
      }

      await logAction(req.user._id, 'MAINTENANCE_RECORD_ADDED', { id: equipment._id });

      res.json({
        success: true,
        data: equipment
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode getMaintenanceSchedule
  async getMaintenanceSchedule(req, res) {
    try {
      const { days = 30 } = req.query;
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() + Number(days));

      const schedule = await Equipment.find({
        companyId: req.user.companyId,
        nextMaintenanceDate: { $lte: dateThreshold }
      }).sort({ nextMaintenanceDate: 1 });

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Méthode validateEquipmentAccess
  async validateEquipmentAccess(equipmentId, companyId) {
    if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
      throw new BadRequestError('Invalid equipment ID');
    }

    const equipment = await Equipment.findOne({
      _id: equipmentId,
      companyId
    });

    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    return equipment;
  }

  // Méthode validateSerialNumberUniqueness
  async validateSerialNumberUniqueness(serialNumber, companyId, excludeId = null) {
    const query = { 
      serialNumber,
      companyId
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Equipment.findOne(query);
    if (existing) {
      throw new BadRequestError('Serial number already exists for this company');
    }
  }

  // Méthode buildEquipmentQuery
  buildEquipmentQuery(req) {
    const query = { companyId: req.user.companyId };
    const { status, type, search } = req.query;

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    return query;
  }

  // Méthode handleError
  handleError(res, error) {
    const statusMap = {
      [mongoose.Error.ValidationError.name]: 400,
      [NotFoundError.name]: 404,
      [BadRequestError.name]: 400,
      [ForbiddenError.name]: 403,
      [mongoose.mongo.MongoServerError.name]: 409
    };

    const status = statusMap[error.constructor.name] || 500;
    const response = {
      success: false,
      message: error.message,
      type: error.constructor.name
    };

    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
      response.details = error;
    }

    res.status(status).json(response);
  }
}

module.exports = new EquipmentController();