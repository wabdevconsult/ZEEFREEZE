const Report = require('../models/Report');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const Intervention = require('../models/Intervention');
const fs = require('fs');
const path = require('path');

// Helper to handle file uploads
const uploadPhotos = async (files) => {
  const photoPaths = [];
  for (const file of files) {
    const uploadPath = path.join(__dirname, '../uploads', file.originalname);
    await fs.promises.writeFile(uploadPath, file.buffer);
    photoPaths.push(`/uploads/${file.originalname}`);
  }
  return photoPaths;
};

exports.countReports = async (req, res) => {
  try {
    const [total, temperature, maintenance, repair] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ type: 'temperature' }),
      Report.countDocuments({ type: 'maintenance' }),
      Report.countDocuments({ type: 'repair' })
    ]);
    
    res.status(200).json({
      success: true,
      data: { 
        count: total,
        byType: {
          temperature,
          maintenance,
          repair,
          other: total - (temperature + maintenance + repair)
        }
      }
    });
  } catch (error) {
    console.error('Error counting reports:', error);
    res.status(500).json({
      success: false,
      error: 'Error counting reports'
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('client technician equipment intervention')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching reports'
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('client technician equipment intervention');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching report'
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { type, ...reportData } = req.body;
    let photos = [];
    
    if (req.files && req.files.length > 0) {
      photos = await uploadPhotos(req.files);
    }
    
    const report = new Report({
      type,
      ...reportData,
      photos,
      technicianId: req.user.id
    });
    
    await report.save();
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (req.files && req.files.length > 0) {
      const photos = await uploadPhotos(req.files);
      updateData.photos = [...(updateData.photos || []), ...photos];
    }
    
    const report = await Report.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('client technician equipment intervention');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error deleting report'
    });
  }
};

exports.addPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No photos provided'
      });
    }
    
    const photos = await uploadPhotos(req.files);
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: photos } } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.signReport = async (req, res) => {
  try {
    const { technicianSignature, clientSignature } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        technicianSignature,
        clientSignature,
        signedAt: new Date(),
        status: 'approved'
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.generatePdf = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('client technician equipment intervention');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generating PDF'
    });
  }
};

exports.getTemperatureLogs = async (req, res) => {
  try {
    const logs = await Report.find({ type: 'temperature' })
      .populate('equipment technician')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching temperature logs'
    });
  }
};

exports.addTemperatureLog = async (req, res) => {
  try {
    const { equipmentId, temperature, notes } = req.body;
    
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found'
      });
    }
    
    const isCompliant = temperature >= equipment.minTemperature && 
                        temperature <= equipment.maxTemperature;
    
    const log = new Report({
      type: 'temperature',
      equipmentId,
      technicianId: req.user.id,
      data: {
        temperature: {
          value: temperature,
          minThreshold: equipment.minTemperature,
          maxThreshold: equipment.maxTemperature,
          isCompliant,
          time: new Date().toLocaleTimeString()
        }
      },
      notes
    });
    
    await log.save();
    
    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};