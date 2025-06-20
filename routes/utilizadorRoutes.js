const express = require('express');
const router = express.Router();
const { listarUtilizadores, atualizarUtilizador, eliminarUtilizador, obterUtilizadorPorId } = require('../controllers/utilizadorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/utilizadores', authMiddleware, listarUtilizadores);

router.get('/utilizadores/:id', authMiddleware, obterUtilizadorPorId)

router.put('/utilizadores/:id', authMiddleware, atualizarUtilizador);
router.delete('/utilizadores/:id', authMiddleware, eliminarUtilizador);

module.exports = router;
