const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  listarAtividades,
  criarAtividade,
  obterAtividadePorId,
  atualizarAtividade,
  eliminarAtividade,
  obterExecucao,
  registarExecucao,
  listarInscricoes,
  inscrever,
  listarAreasTematicasAtividade,
  adicionarAreaTematicaAtividade,
  eliminarAreaTematicaAtividade,
  listarFotosExecucao,
  adicionarFotoExecucao,
  eliminarFotoExecucao
} = require('../controllers/atividadeController');

// Atividades
router.get('/atividades', authMiddleware, listarAtividades);
router.post('/atividades', authMiddleware, criarAtividade);
router.get('/atividades/:id', authMiddleware, obterAtividadePorId);
router.put('/atividades/:id', authMiddleware, atualizarAtividade);
router.delete('/atividades/:id', authMiddleware, eliminarAtividade);

// Execução
router.get('/atividades/:id/execucao', authMiddleware, obterExecucao);
router.post('/atividades/:id/execucao', authMiddleware, registarExecucao);

// Inscrições
router.get('/atividades/:id/inscrever', authMiddleware, listarInscricoes);
router.post('/atividades/:id/inscrever', inscrever);

// Áreas Temáticas associadas à atividade
router.get('/atividades/:id/areas-tematicas', authMiddleware, listarAreasTematicasAtividade);
router.post('/atividades/:id/areas-tematicas', authMiddleware, adicionarAreaTematicaAtividade);
router.delete('/atividades/:id/areas-tematicas/:idAreaTematica', authMiddleware, eliminarAreaTematicaAtividade);

// Fotos da Execução
router.get('/atividades/:id/execucao/:idExecucao/fotos', authMiddleware, listarFotosExecucao);
router.post('/atividades/:id/execucao/:idExecucao/fotos', authMiddleware, adicionarFotoExecucao);
router.delete('/atividades/:id/execucao/:idExecucao/fotos/:idFoto', authMiddleware, eliminarFotoExecucao);

module.exports = router;
