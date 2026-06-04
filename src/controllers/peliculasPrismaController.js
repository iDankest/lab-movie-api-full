const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const listar = async (req, res, next) => {
  try {
    const { genero, pagina = 1, limite = 10 } = req.query
    const skip = (parseInt(pagina) - 1) * parseInt(limite)

    const where = {}
    if (genero) {
      where.genero = { slug: genero }
    }

    const [peliculas, total] = await prisma.$transaction([
      prisma.pelicula.findMany({
        where,
        include: { director: true, genero: true },
        skip,
        take: parseInt(limite),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pelicula.count({ where })
    ])

    res.json({
      data: peliculas,
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite))
    })
  } catch (err) {
    next(err)
  }
}

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return next(new AppError('ID inválido', 400))

    const pelicula = await prisma.pelicula.findUnique({
      where: { id },
      include: {
        director: true,
        genero: true,
        resenas: {
          include: { usuario: { select: { id: true, nombre: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { favoritos: true } }
      }
    })

    if (!pelicula) return next(new AppError('Película no encontrada', 404))

    res.json(pelicula)
  } catch (err) {
    next(err)
  }
}

const crear = async (req, res, next) => {
  try {
    const { titulo, anio, nota, director, generoSlug } = req.body

    const result = await prisma.$transaction(async (tx) => {
      let directorRecord = await tx.director.findUnique({ where: { nombre: director } })
      if (!directorRecord) {
        directorRecord = await tx.director.create({ data: { nombre: director } })
      }

      let generoRecord = null
      if (generoSlug) {
        generoRecord = await tx.genero.findUnique({ where: { slug: generoSlug } })
      }

      return tx.pelicula.create({
        data: {
          titulo,
          anio: parseInt(anio),
          nota: nota ? parseFloat(nota) : null,
          directorId: directorRecord.id,
          generoId: generoRecord?.id || null
        },
        include: { director: true, genero: true }
      })
    })

    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

const actualizar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return next(new AppError('ID inválido', 400))

    const { titulo, anio, nota, director, generoSlug } = req.body

    const result = await prisma.$transaction(async (tx) => {
      let directorRecord = null
      if (director) {
        directorRecord = await tx.director.findUnique({ where: { nombre: director } })
        if (!directorRecord) {
          directorRecord = await tx.director.create({ data: { nombre: director } })
        }
      }

      let generoRecord = null
      if (generoSlug) {
        generoRecord = await tx.genero.findUnique({ where: { slug: generoSlug } })
      }

      return tx.pelicula.update({
        where: { id },
        data: {
          ...(titulo && { titulo }),
          ...(anio && { anio: parseInt(anio) }),
          ...(nota && { nota: parseFloat(nota) }),
          ...(directorRecord && { directorId: directorRecord.id }),
          ...(generoRecord && { generoId: generoRecord.id })
        },
        include: { director: true, genero: true }
      })
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
}

const eliminar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return next(new AppError('ID inválido', 400))

    const pelicula = await prisma.pelicula.findUnique({ where: { id } })
    if (!pelicula) return next(new AppError('Película no encontrada', 404))

    await prisma.pelicula.delete({ where: { id } })
    res.json({ mensaje: 'Película eliminada correctamente' })
  } catch (err) {
    next(err)
  }
}

const listarResenas = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return next(new AppError('ID inválido', 400))

    const resenas = await prisma.resena.findMany({
      where: { peliculaId: id },
      include: { usuario: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json(resenas)
  } catch (err) {
    next(err)
  }
}

const crearResena = async (req, res, next) => {
  try {
    const peliculaId = parseInt(req.params.id)
    if (isNaN(peliculaId)) return next(new AppError('ID inválido', 400))

    const pelicula = await prisma.pelicula.findUnique({ where: { id: peliculaId } })
    if (!pelicula) return next(new AppError('Película no encontrada', 404))

    const { texto, puntuacion } = req.body

    const resena = await prisma.resena.create({
      data: {
        texto,
        puntuacion: parseInt(puntuacion),
        peliculaId,
        usuarioId: req.usuario.id
      },
      include: { usuario: { select: { id: true, nombre: true } } }
    })

    res.status(201).json(resena)
  } catch (err) {
    next(err)
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, listarResenas, crearResena }
