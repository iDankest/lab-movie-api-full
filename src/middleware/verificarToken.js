const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token no proporcionado', 401))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    return next(new AppError('Token inválido', 401))
  }
}

module.exports = { verificarToken }
