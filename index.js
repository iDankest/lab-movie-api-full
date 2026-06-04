require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

const authRouter = require('./src/routes/auth')
const peliculasRouter = require('./src/routes/peliculas')
const favoritosRouter = require('./src/routes/favoritos')
const estadisticasRouter = require('./src/routes/estadisticas')
const iaRouter = require('./src/routes/ia')

app.use('/api/auth', authRouter)
app.use('/api/peliculas', peliculasRouter)
app.use('/api/favoritos', favoritosRouter)
app.use('/api/estadisticas', estadisticasRouter)
app.use('/api/ia', iaRouter)

const errorHandler = require('./src/middleware/errorHandler')
app.use(errorHandler)

module.exports = app

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
}
