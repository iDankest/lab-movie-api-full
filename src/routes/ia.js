const { Router } = require('express')
const router = Router()
const { recomendar } = require('../controllers/iaController')

router.post('/recomendar', recomendar)

module.exports = router
