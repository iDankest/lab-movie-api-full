const { Router } = require('express')
const router = Router()
const peliculasController = require('../controllers/peliculasPrismaController')
const { verificarToken } = require('../middleware/verificarToken')
const { verificarRol } = require('../middleware/verificarRol')

router.get('/', peliculasController.listar)
router.get('/:id', peliculasController.obtener)
router.post('/', verificarToken, peliculasController.crear)
router.put('/:id', verificarToken, verificarRol('admin'), peliculasController.actualizar)
router.delete('/:id', verificarToken, verificarRol('admin'), peliculasController.eliminar)
router.get('/:id/resenas', peliculasController.listarResenas)
router.post('/:id/resenas', verificarToken, peliculasController.crearResena)

module.exports = router
