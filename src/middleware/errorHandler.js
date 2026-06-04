const AppError = require('../utils/AppError')

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'El recurso ya existe' })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado' })
  }

  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}

module.exports = errorHandler
