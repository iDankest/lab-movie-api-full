const { Router } = require('express')
const router = Router()
const { listar, agregar, eliminar } = require('../controllers/favoritosController')
const { verificarToken } = require('../middleware/verificarToken')

router.get('/', verificarToken, listar)
router.post('/:id', verificarToken, agregar)
router.delete('/:id', verificarToken, eliminar)

module.exports = router
