const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const listar = async (req, res, next) => {
  try {
    const favoritos = await prisma.favorito.findMany({
      where: { usuarioId: req.usuario.id },
      include: {
        pelicula: { include: { director: true, genero: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(favoritos)
  } catch (err) {
    next(err)
  }
}

const agregar = async (req, res, next) => {
  try {
    const peliculaId = parseInt(req.params.id)
    if (isNaN(peliculaId)) return next(new AppError('ID inválido', 400))

    const pelicula = await prisma.pelicula.findUnique({ where: { id: peliculaId } })
    if (!pelicula) return next(new AppError('Película no encontrada', 404))

    const existe = await prisma.favorito.findUnique({
      where: { peliculaId_usuarioId: { peliculaId, usuarioId: req.usuario.id } }
    })
    if (existe) return next(new AppError('La película ya está en favoritos', 409))

    const favorito = await prisma.favorito.create({
      data: { peliculaId, usuarioId: req.usuario.id },
      include: { pelicula: true }
    })

    res.status(201).json(favorito)
  } catch (err) {
    next(err)
  }
}

const eliminar = async (req, res, next) => {
  try {
    const peliculaId = parseInt(req.params.id)
    if (isNaN(peliculaId)) return next(new AppError('ID inválido', 400))

    const favorito = await prisma.favorito.findUnique({
      where: { peliculaId_usuarioId: { peliculaId, usuarioId: req.usuario.id } }
    })
    if (!favorito) return next(new AppError('Favorito no encontrado', 404))

    await prisma.favorito.delete({
      where: { peliculaId_usuarioId: { peliculaId, usuarioId: req.usuario.id } }
    })

    res.json({ mensaje: 'Favorito eliminado correctamente' })
  } catch (err) {
    next(err)
  }
}

module.exports = { listar, agregar, eliminar }
