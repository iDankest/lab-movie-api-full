const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const AppError = require('../utils/AppError')

const registro = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body

    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return next(new AppError('El email ya está registrado', 400))

    const hashedPassword = await bcrypt.hash(password, 10)
    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hashedPassword, rol: rol || 'user' }
    })

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) return next(new AppError('Credenciales inválidas', 401))

    const valido = await bcrypt.compare(password, usuario.password)
    if (!valido) return next(new AppError('Credenciales inválidas', 401))

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    })
  } catch (err) {
    next(err)
  }
}

const perfil = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nombre: true, email: true, rol: true, createdAt: true }
    })
    res.json(usuario)
  } catch (err) {
    next(err)
  }
}

module.exports = { registro, login, perfil }
