module.exports = (err, req, res, next) => {
  console.error(err.stack || err.message || err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate Key Error',
      message: 'This resource already exists'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token'
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};