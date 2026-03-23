const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateJWT = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token && req.cookies?.token) token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Token no proporcionado.' });

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol admin.' });
  next();
};

module.exports = { authenticateJWT, isAdmin };
