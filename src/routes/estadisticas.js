const { Router } = require('express')
const router = Router()
const { directores, generos } = require('../controllers/estadisticasController')

router.get('/directores', directores)
router.get('/generos', generos)

module.exports = router
