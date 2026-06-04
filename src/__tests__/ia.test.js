const request = require('supertest')
const app = require('../../index')
const { limpiarDB, crearPelicula, desconectar } = require('../test/helpers')

beforeAll(async () => {
  await limpiarDB()
})

afterAll(async () => {
  await desconectar()
})

describe('POST /api/ia/recomendar', () => {

  beforeEach(async () => {
    await limpiarDB()
    await crearPelicula({ titulo: 'Film A', nota: 8.5 })
    await crearPelicula({ titulo: 'Film B', nota: 6.0 })
    await crearPelicula({ titulo: 'Film C', nota: 9.0 })
  })

  it('debe devolver películas con la estructura correcta', async () => {
    const res = await request(app)
      .post('/api/ia/recomendar')
      .send({})

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('contexto')
    expect(res.body).toHaveProperty('peliculas')
    expect(res.body).toHaveProperty('metadata')
    expect(Array.isArray(res.body.peliculas)).toBe(true)
  })

  it('debe filtrar por nota mínima', async () => {
    const res = await request(app)
      .post('/api/ia/recomendar')
      .send({ nota_minima: 8.0 })

    expect(res.status).toBe(200)
    res.body.peliculas.forEach(p => {
      expect(Number(p.nota)).toBeGreaterThanOrEqual(8.0)
    })
  })

  it('debe respetar el campo excluir_ids', async () => {
    const lista = await request(app).get('/api/peliculas?limit=100')
    const primerID = lista.body.data[0]?.id

    if (primerID) {
      const res = await request(app)
        .post('/api/ia/recomendar')
        .send({ excluir_ids: [primerID] })

      const ids = res.body.peliculas.map(p => p.id)
      expect(ids).not.toContain(primerID)
    }
  })

  it('debe respetar el límite de resultados', async () => {
    const res = await request(app)
      .post('/api/ia/recomendar')
      .send({ limite: 1 })

    expect(res.body.peliculas.length).toBeLessThanOrEqual(1)
  })
})
