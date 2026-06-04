const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Limpiando base de datos...')
  await prisma.favorito.deleteMany()
  await prisma.resena.deleteMany()
  await prisma.pelicula.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.director.deleteMany()
  await prisma.genero.deleteMany()

  console.log('Creando géneros...')
  const generos = await Promise.all([
    prisma.genero.create({ data: { nombre: 'Ciencia Ficción', slug: 'ciencia-ficcion' } }),
    prisma.genero.create({ data: { nombre: 'Drama', slug: 'drama' } }),
    prisma.genero.create({ data: { nombre: 'Acción', slug: 'accion' } }),
    prisma.genero.create({ data: { nombre: 'Terror', slug: 'terror' } }),
    prisma.genero.create({ data: { nombre: 'Comedia', slug: 'comedia' } }),
  ])

  console.log('Creando directores...')
  const directores = await Promise.all([
    prisma.director.create({ data: { nombre: 'Denis Villeneuve' } }),
    prisma.director.create({ data: { nombre: 'Christopher Nolan' } }),
    prisma.director.create({ data: { nombre: 'Jordan Peele' } }),
    prisma.director.create({ data: { nombre: 'Greta Gerwig' } }),
    prisma.director.create({ data: { nombre: 'Bong Joon-ho' } }),
  ])

  console.log('Creando películas...')
  const peliculas = await Promise.all([
    prisma.pelicula.create({
      data: { titulo: 'Arrival', anio: 2016, nota: 7.9, directorId: directores[0].id, generoId: generos[0].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Blade Runner 2049', anio: 2017, nota: 8.0, directorId: directores[0].id, generoId: generos[0].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Dune', anio: 2021, nota: 8.0, directorId: directores[0].id, generoId: generos[0].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Inception', anio: 2010, nota: 8.8, directorId: directores[1].id, generoId: generos[2].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Interstellar', anio: 2014, nota: 8.7, directorId: directores[1].id, generoId: generos[0].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Get Out', anio: 2017, nota: 7.7, directorId: directores[2].id, generoId: generos[3].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Nope', anio: 2022, nota: 6.9, directorId: directores[2].id, generoId: generos[3].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Lady Bird', anio: 2017, nota: 7.4, directorId: directores[3].id, generoId: generos[1].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Little Women', anio: 2019, nota: 7.8, directorId: directores[3].id, generoId: generos[1].id }
    }),
    prisma.pelicula.create({
      data: { titulo: 'Parasite', anio: 2019, nota: 8.5, directorId: directores[4].id, generoId: generos[1].id }
    }),
  ])

  console.log('Creando usuarios...')
  const password = await bcrypt.hash('password123', 10)
  const admin = await prisma.usuario.create({
    data: { nombre: 'Admin', email: 'admin@cine.com', password, rol: 'admin' }
  })
  const user = await prisma.usuario.create({
    data: { nombre: 'Usuario', email: 'user@cine.com', password, rol: 'user' }
  })

  console.log('Creando reseñas...')
  await prisma.resena.createMany({
    data: [
      { texto: 'Obra maestra', puntuacion: 9, peliculaId: peliculas[0].id, usuarioId: user.id },
      { texto: 'Visualmente impresionante', puntuacion: 8, peliculaId: peliculas[1].id, usuarioId: user.id },
      { texto: 'La mejor de la década', puntuacion: 10, peliculaId: peliculas[3].id, usuarioId: user.id },
    ]
  })

  console.log('✅ Seed completado!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
