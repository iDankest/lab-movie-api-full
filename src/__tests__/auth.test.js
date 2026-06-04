const request = require('supertest')
const app = require('../../index')
const { limpiarDB, desconectar } = require('../test/helpers')
const prisma = require('../config/prisma')

beforeAll(async () => {
  await limpiarDB()
})

afterAll(async () => {
  await desconectar()
})

describe('POST /api/auth/registro', () => {
  it('debe registrar un usuario y devolver token', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Test', email: 'test@test.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.usuario).toHaveProperty('email', 'test@test.com')
  })

  it('debe rechazar email duplicado', async () => {
    await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Test', email: 'dup@test.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Test2', email: 'dup@test.com', password: 'password123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('debe iniciar sesión con credenciales válidas', async () => {
    await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Test', email: 'login@test.com', password: 'password123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('debe rechazar credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no@existe.com', password: 'wrong' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/perfil', () => {
  it('debe devolver 401 sin token', async () => {
    const res = await request(app).get('/api/auth/perfil')
    expect(res.status).toBe(401)
  })

  it('debe devolver el perfil con token válido', async () => {
    const reg = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Perfil', email: 'perfil@test.com', password: 'password123' })

    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${reg.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('email', 'perfil@test.com')
  })
})
