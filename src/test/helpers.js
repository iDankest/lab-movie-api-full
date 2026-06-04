const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

const limpiarDB = async () => {
  await prisma.favorito.deleteMany()
  await prisma.resena.deleteMany()
  await prisma.pelicula.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.director.deleteMany()
  await prisma.genero.deleteMany()
}

const crearUsuario = async (datos = {}) => {
  const email = datos.email || `user${Date.now()}@test.com`
  const password = await bcrypt.hash(datos.password || 'password123', 10)
  return prisma.usuario.create({
    data: {
      nombre: datos.nombre || 'Test User',
      email,
      password,
      rol: datos.rol || 'user'
    }
  })
}

const obtenerToken = async (datos = {}) => {
  const usuario = await crearUsuario(datos)
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET || 'test-secret'
  )
}

const crearPelicula = async (datos = {}) => {
  let director = await prisma.director.findFirst()
  if (!director) {
    director = await prisma.director.create({
      data: { nombre: datos.director || 'Director Test' }
    })
  }

  let genero = await prisma.genero.findFirst()
  if (!genero) {
    genero = await prisma.genero.create({
      data: { nombre: 'Ciencia Ficción', slug: 'ciencia-ficcion' }
    })
  }

  return prisma.pelicula.create({
    data: {
      titulo: datos.titulo || `Film ${Date.now()}`,
      anio: datos.anio || 2024,
      nota: datos.nota || 7.0,
      directorId: director.id,
      generoId: genero.id
    },
    include: { director: true, genero: true }
  })
}

const desconectar = async () => {
  await prisma.$disconnect()
}

module.exports = { limpiarDB, crearUsuario, obtenerToken, crearPelicula, desconectar }
