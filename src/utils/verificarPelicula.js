const prisma = require('../config/prisma')
const AppError = require('./AppError')

const verificarPelicula = async (req, res, next) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return next(new AppError('ID de película inválido', 400))

  const pelicula = await prisma.pelicula.findUnique({ where: { id } })
  if (!pelicula) return next(new AppError('Película no encontrada', 404))

  req.pelicula = pelicula
  next()
}

module.exports = { verificarPelicula }
