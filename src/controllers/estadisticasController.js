const prisma = require('../config/prisma')

const directores = async (req, res, next) => {
  try {
    const stats = await prisma.director.findMany({
      include: { _count: { select: { peliculas: true } } },
      orderBy: { nombre: 'asc' }
    })
    res.json(stats)
  } catch (err) {
    next(err)
  }
}

const generos = async (req, res, next) => {
  try {
    const stats = await prisma.genero.findMany({
      include: { _count: { select: { peliculas: true } } },
      orderBy: { nombre: 'asc' }
    })
    res.json(stats)
  } catch (err) {
    next(err)
  }
}

module.exports = { directores, generos }
