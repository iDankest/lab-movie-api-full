const request = require('supertest')
const app = require('../../index')
const { limpiarDB, crearPelicula, obtenerToken, desconectar } = require('../test/helpers')

beforeAll(async () => {
  await limpiarDB()
})

afterAll(async () => {
  await desconectar()
})

describe('GET /api/favoritos', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe devolver 401 sin token', async () => {
    const res = await request(app).get('/api/favoritos')
    expect(res.status).toBe(401)
  })

  it('debe devolver lista de favoritos del usuario', async () => {
    const token = await obtenerToken()
    const pelicula = await crearPelicula()

    await request(app)
      .post(`/api/favoritos/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .get('/api/favoritos')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })
})

describe('POST /api/favoritos/:id', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe agregar película a favoritos', async () => {
    const token = await obtenerToken()
    const pelicula = await crearPelicula()

    const res = await request(app)
      .post(`/api/favoritos/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(201)
  })

  it('debe devolver 409 en duplicado', async () => {
    const token = await obtenerToken()
    const pelicula = await crearPelicula()

    await request(app)
      .post(`/api/favoritos/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .post(`/api/favoritos/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(409)
  })

  it('debe devolver 404 si la película no existe', async () => {
    const token = await obtenerToken()
    const res = await request(app)
      .post('/api/favoritos/99999')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/favoritos/:id', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe eliminar película de favoritos', async () => {
    const token = await obtenerToken()
    const pelicula = await crearPelicula()

    await request(app)
      .post(`/api/favoritos/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    const res = await request(app)
      .delete(`/api/favoritos/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })
})
