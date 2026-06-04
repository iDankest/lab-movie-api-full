const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const recomendar = async (req, res, next) => {
  try {
    const {
      generos = [],
      nota_minima = 0,
      excluir_ids = [],
      limite = 10
    } = req.body

    const where = {
      nota: { gte: nota_minima },
      id: { notIn: excluir_ids.map(Number) }
    }

    if (generos.length > 0) {
      where.genero = {
        slug: { in: generos }
      }
    }

    const [peliculas, totalSistema] = await prisma.$transaction([
      prisma.pelicula.findMany({
        where,
        include: {
          director: { select: { nombre: true } },
          genero: { select: { nombre: true, slug: true } },
          resenas: {
            select: { puntuacion: true }
          }
        },
        orderBy: { nota: 'desc' },
        take: Number(limite)
      }),
      prisma.pelicula.count()
    ])

    const peliculasFormateadas = peliculas.map(p => {
      const mediaUsuarios = p.resenas.length > 0
        ? p.resenas.reduce((acc, r) => acc + r.puntuacion, 0) / p.resenas.length
        : null

      return {
        id: p.id,
        titulo: p.titulo,
        anio: p.anio,
        nota: p.nota ? Number(p.nota) : null,
        director: p.director?.nombre || null,
        genero: p.genero?.slug || null,
        num_resenas: p.resenas.length,
        media_usuarios: mediaUsuarios ? Number(mediaUsuarios.toFixed(2)) : null
      }
    })

    res.json({
      contexto: `Tienes ${totalSistema} películas en tu sistema.`,
      peliculas: peliculasFormateadas,
      metadata: {
        total_encontradas: peliculasFormateadas.length,
        filtros_aplicados: {
          generos: generos.length > 0 ? generos : 'todos',
          nota_minima,
          excluidas: excluir_ids.length
        }
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { recomendar }
