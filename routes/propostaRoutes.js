const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  submeterProposta,
  listarPropostas,
  obterPropostaPorId,
  aprovarProposta,
  rejeitarProposta
} = require('../controllers/propostaController');

// Submeter proposta
router.post('/propostas', authMiddleware, submeterProposta);

// Listar propostas
router.get('/propostas', authMiddleware, listarPropostas);

// Obter proposta por ID
router.get('/propostas/:id', authMiddleware, obterPropostaPorId);

// Aprovar proposta
router.put('/propostas/:id/aprovar', authMiddleware, aprovarProposta);

// Rejeitar proposta
router.put('/propostas/:id/rejeitar', authMiddleware, rejeitarProposta);

module.exports = router;
