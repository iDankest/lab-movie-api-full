const AppError = require('../utils/AppError')

const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403))
    }
    next()
  }
}

module.exports = { verificarRol }
