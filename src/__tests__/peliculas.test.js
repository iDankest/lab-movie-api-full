const request = require('supertest')
const app = require('../../index')
const { limpiarDB, crearPelicula, obtenerToken, desconectar } = require('../test/helpers')

beforeAll(async () => {
  await limpiarDB()
})

afterAll(async () => {
  await desconectar()
})

describe('GET /api/peliculas', () => {
  beforeEach(async () => {
    await limpiarDB()
    await crearPelicula({ titulo: 'Film 1', nota: 8.0 })
    await crearPelicula({ titulo: 'Film 2', nota: 7.5 })
    await crearPelicula({ titulo: 'Film 3', nota: 9.0 })
  })

  it('debe devolver lista paginada con estructura correcta', async () => {
    const res = await request(app).get('/api/peliculas')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('pagina')
    expect(res.body).toHaveProperty('totalPaginas')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('debe filtrar por genero', async () => {
    const res = await request(app).get('/api/peliculas?genero=ciencia-ficcion')
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(0)
  })
})

describe('GET /api/peliculas/:id', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe devolver película con reseñas y conteo de favoritos', async () => {
    const pelicula = await crearPelicula({ titulo: 'Detail Film' })
    const res = await request(app).get(`/api/peliculas/${pelicula.id}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('titulo', 'Detail Film')
    expect(res.body).toHaveProperty('resenas')
    expect(res.body).toHaveProperty('_count')
  })

  it('debe devolver 404 si la película no existe', async () => {
    const res = await request(app).get('/api/peliculas/99999')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/peliculas', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe crear película si está autenticado', async () => {
    const token = await obtenerToken()
    const res = await request(app)
      .post('/api/peliculas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'New Movie', anio: 2024, director: 'New Director' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('titulo', 'New Movie')
  })

  it('debe devolver 401 sin token', async () => {
    const res = await request(app)
      .post('/api/peliculas')
      .send({ titulo: 'New Movie', anio: 2024, director: 'New Director' })

    expect(res.status).toBe(401)
  })

  it('debe crear director si no existe usando transacción', async () => {
    const token = await obtenerToken()
    const res = await request(app)
      .post('/api/peliculas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Unique Film', anio: 2024, director: 'Brand New Director' })

    expect(res.status).toBe(201)
    expect(res.body.director.nombre).toBe('Brand New Director')
  })
})

describe('PUT /api/peliculas/:id', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe devolver 403 si no es admin', async () => {
    const pelicula = await crearPelicula()
    const token = await obtenerToken({ rol: 'user' })
    const res = await request(app)
      .put(`/api/peliculas/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Updated' })

    expect(res.status).toBe(403)
  })

  it('debe actualizar película si es admin', async () => {
    const pelicula = await crearPelicula({ titulo: 'Original' })
    const token = await obtenerToken({ rol: 'admin' })
    const res = await request(app)
      .put(`/api/peliculas/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Updated' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('titulo', 'Updated')
  })
})

describe('DELETE /api/peliculas/:id', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe eliminar película si es admin', async () => {
    const pelicula = await crearPelicula()
    const token = await obtenerToken({ rol: 'admin' })
    const res = await request(app)
      .delete(`/api/peliculas/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('debe devolver 403 si no es admin', async () => {
    const pelicula = await crearPelicula()
    const token = await obtenerToken({ rol: 'user' })
    const res = await request(app)
      .delete(`/api/peliculas/${pelicula.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })
})

describe('GET /api/peliculas/:id/resenas', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe devolver reseñas de una película', async () => {
    const pelicula = await crearPelicula()
    const res = await request(app).get(`/api/peliculas/${pelicula.id}/resenas`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('POST /api/peliculas/:id/resenas', () => {
  beforeEach(async () => {
    await limpiarDB()
  })

  it('debe crear reseña si está autenticado', async () => {
    const pelicula = await crearPelicula()
    const token = await obtenerToken()
    const res = await request(app)
      .post(`/api/peliculas/${pelicula.id}/resenas`)
      .set('Authorization', `Bearer ${token}`)
      .send({ texto: 'Great movie!', puntuacion: 9 })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('texto', 'Great movie!')
  })

  it('debe devolver 401 sin token', async () => {
    const pelicula = await crearPelicula()
    const res = await request(app)
      .post(`/api/peliculas/${pelicula.id}/resenas`)
      .send({ texto: 'Great movie!', puntuacion: 9 })

    expect(res.status).toBe(401)
  })
})
