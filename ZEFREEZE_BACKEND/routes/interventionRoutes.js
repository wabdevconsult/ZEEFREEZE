const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const controller = require('../controllers/interventionController');
const upload = require('../middlewares/uploadMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
  createInterventionSchema,
  updateInterventionSchema,
  statusSchema
} = require('../validations/interventionValidation');

const rateLimit = require('express-rate-limit');

const modificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many modification attempts, please try again later'
});

router.use(auth);

router.get('/',
  rateLimit({ windowMs: 60 * 1000, max: 30 }),
  controller.getAll
);

router.get('/:id',
  rateLimit({ windowMs: 60 * 1000, max: 30 }),
  controller.getById
);

router.post('/',
  modificationLimiter,
  validate(createInterventionSchema),
  controller.create
);

router.patch('/:id',
  modificationLimiter,
  validate(updateInterventionSchema),
  controller.update
);

router.delete('/:id',
  modificationLimiter,
  roleMiddleware(['admin']),
  controller.delete
);

router.patch('/:id/status',
  modificationLimiter,
  validate(statusSchema),
  controller.updateStatus
);

router.post('/:id/photos',
  modificationLimiter,
  upload.array('photos', 3),
  controller.uploadPhotos
);

module.exports = router;