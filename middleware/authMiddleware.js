const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ errorMessage: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ errorMessage: 'Token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.utilizador = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ errorMessage: 'Token inválido.' });
  }
}

module.exports = autenticar;
