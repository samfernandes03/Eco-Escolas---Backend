const express = require('express');
const router = express.Router();
const { listarUtilizadores, atualizarUtilizador, eliminarUtilizador } = require('../controllers/utilizadorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/utilizadores', authMiddleware, listarUtilizadores);
router.put('/utilizadores/:id', authMiddleware, atualizarUtilizador);
router.delete('/utilizadores/:id', authMiddleware, eliminarUtilizador); 

module.exports = router;
