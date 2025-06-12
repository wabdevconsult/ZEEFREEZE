const { ValidationError } = require('joi');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      errors: err.details.map(e => ({
        field: e.context.key,
        message: e.message
      }))
    });
  }
};

const handleValidationErrors = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      errors: err.details.map(e => ({
        field: e.context.key,
        message: e.message
      }))
    });
  }
  next(err);
};

module.exports = {
  validate,
  handleValidationErrors
};