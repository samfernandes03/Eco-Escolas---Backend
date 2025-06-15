const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');
const reuniaoController = require('../controllers/reuniaoController');
const autenticarToken = require('../middleware/authMiddleware');

// Rotas de projetos
router.get('/projetos', autenticarToken, projetoController.listarProjetos);
router.get('/projetos/:id', autenticarToken, projetoController.obterProjetoPorId);
router.post('/projetos', autenticarToken, projetoController.criarProjeto);
router.put('/projetos/:id', autenticarToken, projetoController.atualizarProjeto);
router.delete('/projetos/:id', autenticarToken, projetoController.eliminarProjeto);
router.get('/projetos/:id/coordenador', autenticarToken, projetoController.obterCoordenador);
router.put('/projetos/:id/coordenador', autenticarToken, projetoController.atualizarCoordenador);

// Rotas de reuniões dentro do projeto
router.get('/projetos/:id/reunioes', autenticarToken, reuniaoController.listarReunioesPorProjeto);
router.post('/projetos/:id/reunioes', autenticarToken, reuniaoController.adicionarReuniao);
router.put('/projetos/:id/reunioes/:idReuniao', autenticarToken, reuniaoController.editarReuniao);
router.delete('/projetos/:id/reunioes/:idReuniao', autenticarToken, reuniaoController.removerReuniao);

module.exports = router;
