const express = require('express');
const router = express.Router();

const {
  listarAreasTematicas,
  criarAreaTematica,
  obterAreaTematicaPorId,
  atualizarAreaTematica,
  eliminarAreaTematica
} = require('../controllers/areaTematicaController');

const authMiddleware = require('../middleware/authMiddleware');

// Listar todas as áreas temáticas
router.get('/areas-tematicas', authMiddleware, listarAreasTematicas);

// Criar nova área temática
router.post('/areas-tematicas', authMiddleware, criarAreaTematica);

// Obter área temática pelo ID
router.get('/areas-tematicas/:id', authMiddleware, obterAreaTematicaPorId);

// Atualizar área temática
router.put('/areas-tematicas/:id', authMiddleware, atualizarAreaTematica);

// Eliminar área temática
router.delete('/areas-tematicas/:id', authMiddleware, eliminarAreaTematica);

module.exports = router;
