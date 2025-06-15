const planoController = require('../controllers/planoController');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // ajusta o caminho conforme o teu projeto

// Todas as rotas de planos protegidas com autenticação JWT
router.get('/planos', authMiddleware, planoController.listarPlanos);
router.post('/planos', authMiddleware, planoController.criarPlano);
router.get('/planos/:id', authMiddleware, planoController.obterPlanoPorId);
router.put('/planos/:id', authMiddleware, planoController.atualizarPlano);
router.delete('/planos/:id', authMiddleware, planoController.eliminarPlano);
router.get('/projetos/:id/planos', authMiddleware, planoController.listarPlanosPorProjeto);

module.exports = router;
