const Intervention = require('../models/Intervention');
const { 
  sendNotification 
} = require('../service/notificationService');
const { 
  generateHACCPReport 
} = require('../service/haccpService');
const { 
  uploadToS3,
  validateFileType 
} = require('../service/fileUploadService');
const {
  NotFoundError,
  BadRequestError,
  ForbiddenError
} = require('../errors');
const mongoose = require('mongoose');

const populateFields = [
  { path: 'clientDetails', select: 'name email phone' },
  { path: 'technicienDetails', select: 'name email phone' },
  { path: 'equipmentDetails', select: 'name type serialNumber' }
];

class InterventionController {
  // Helper methods
  async getInterventionOrFail(id) {
    const intervention = await Intervention.findById(id).populate(populateFields);
    if (!intervention) {
      throw new NotFoundError('Intervention not found');
    }
    return intervention;
  }

  checkPermission(intervention, user) {
    if (user.role === 'admin') return true;
    if (intervention.createdBy.equals(user._id)) return true;
    if (intervention.technicien?.equals(user._id)) return true;
    throw new ForbiddenError('Unauthorized access to intervention');
  }

  // Controller methods
  async getAll(req, res) {
    try {
      const { status, clientId, technicienId, equipmentId } = req.query;
      const filter = this.buildFilter(req.user, { status, clientId, technicienId, equipmentId });
      
      const interventions = await Intervention.find(filter)
        .populate(populateFields)
        .sort({ createdAt: -1 });

      res.json(interventions);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getById(req, res) {
    try {
      const intervention = await this.getInterventionOrFail(req.params.id);
      this.checkPermission(intervention, req.user);
      res.json(intervention);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req, res) {
    try {
      const interventionData = this.prepareInterventionData(req);
      const intervention = await Intervention.create(interventionData);
      
      await this.sendCreationNotification(intervention);
      res.status(201).json(intervention);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      const intervention = await this.getInterventionOrFail(req.params.id);
      this.checkPermission(intervention, req.user);

      const updated = await this.performUpdate(intervention, req.body);
      await this.handleStatusChange(intervention, updated);
      await this.handleHACCPUpdate(intervention, updated);

      res.json(updated);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async delete(req, res) {
    try {
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Only admins can delete interventions');
      }

      const deleted = await Intervention.findByIdAndDelete(req.params.id);
      if (!deleted) {
        throw new NotFoundError('Intervention not found');
      }
      res.status(204).end();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async uploadPhotos(req, res) {
    try {
      const intervention = await this.getInterventionOrFail(req.params.id);
      this.checkPermission(intervention, req.user);

      const files = this.validateUploadedFiles(req.files);
      const photoUrls = await this.uploadFilesToStorage(files);
      const updated = await this.updateInterventionPhotos(intervention, photoUrls);

      res.json(updated);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateStatus(req, res) {
    try {
      const intervention = await this.getInterventionOrFail(req.params.id);
      this.checkPermission(intervention, req.user);

      const updated = await Intervention.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate(populateFields);

      await this.sendStatusNotification(intervention, updated);
      res.json(updated);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Private helper methods
  buildFilter(user, filters) {
    const { status, clientId, technicienId, equipmentId } = filters;
    const filter = {};
    
    if (status) filter.status = status;
    if (clientId) filter.client = clientId;
    if (technicienId) filter.technicien = technicienId;
    if (equipmentId) filter.equipment = equipmentId;
    
    if (user.role !== 'admin') {
      filter.$or = [
        { createdBy: user._id },
        { technicien: user._id }
      ];
    }

    return filter;
  }

  prepareInterventionData(req) {
    return {
      ...req.body,
      createdBy: req.user._id,
      client: req.body.client || req.user._id,
      companyId: req.user.companyId
    };
  }

  async performUpdate(intervention, updateData) {
    return Intervention.findByIdAndUpdate(
      intervention._id,
      updateData,
      { new: true, runValidators: true }
    ).populate(populateFields);
  }

  async handleStatusChange(oldIntervention, updatedIntervention) {
    if (updatedIntervention.status !== oldIntervention.status) {
      await sendNotification({
        type: 'STATUS_CHANGED',
        recipient: updatedIntervention.client,
        data: {
          interventionId: updatedIntervention._id,
          newStatus: updatedIntervention.status,
          message: `Status updated: ${updatedIntervention.status}`
        }
      });
    }
  }

  async handleHACCPUpdate(oldIntervention, updatedIntervention) {
    const haccpChanged = (
      updatedIntervention.temperature_relevee !== oldIntervention.temperature_relevee ||
      updatedIntervention.conforme_HACCP !== oldIntervention.conforme_HACCP
    );

    if (haccpChanged && !updatedIntervention.conforme_HACCP) {
      await generateHACCPReport(updatedIntervention);
    }
  }

  validateUploadedFiles(files) {
    if (!files || files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }
    files.forEach(file => validateFileType(file));
    return files;
  }

  async uploadFilesToStorage(files) {
    return Promise.all(files.map(file => uploadToS3(file)));
  }

  async updateInterventionPhotos(intervention, photoUrls) {
    return Intervention.findByIdAndUpdate(
      intervention._id,
      { $push: { photos: { $each: photoUrls } } },
      { new: true }
    );
  }

  async sendCreationNotification(intervention) {
    await sendNotification({
      type: 'NEW_INTERVENTION',
      recipientRoles: ['admin', 'technician'],
      data: {
        interventionId: intervention._id,
        message: `New intervention created for ${intervention.equipment}`
      }
    });
  }

  async sendStatusNotification(oldIntervention, updatedIntervention) {
    if (oldIntervention.status !== updatedIntervention.status) {
      await sendNotification({
        type: 'STATUS_CHANGED',
        recipient: updatedIntervention.client,
        data: {
          interventionId: updatedIntervention._id,
          newStatus: updatedIntervention.status,
          message: `Status updated to ${updatedIntervention.status}`
        }
      });
    }
  }

 async validateInterventionOwnership(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const interventionId = req.params.id;

      if (!userId || !interventionId) {
        return res.status(400).json({ error: "Requête invalide (ID manquant)." });
      }

      const intervention = await this.getInterventionOrFail(interventionId);
      this.checkPermission(intervention, req.user);
      next();
    } catch (err) {
      console.error("Erreur validateInterventionOwnership:", err);
      res.status(500).json({ error: "Erreur serveur lors de la validation." });
    }
  }

  handleError(res, error) {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
  }
}




module.exports = new InterventionController();