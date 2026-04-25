const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, no token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = await Customer.findById(decoded.id).select('-password');

    if (!req.customer) {
      return res.status(401).json({ 
        message: 'Not authorized, customer not found' 
      });
    }

    next();

  } catch (error) {
    return res.status(401).json({ 
      message: 'Not authorized, token failed' 
    });
  }
};

module.exports = protect;