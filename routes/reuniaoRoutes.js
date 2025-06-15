const express = require('express');
const router = express.Router();

const reunioesController = require('../controllers/reuniaoController');

// Listar todas as reuniões
router.get('/reunioes', reunioesController.listarReunioes);

// Criar nova reunião
router.post('/reunioes', reunioesController.criarReuniao);

// Ver detalhes de uma reunião
router.get('/reunioes/:id', reunioesController.verDetalhesReuniao);

// Adicionar anexo a uma reunião
router.post('/reunioes/:id/anexos', reunioesController.adicionarAnexo);

// Listar anexos de uma reunião
router.get('/reunioes/:id/anexos', reunioesController.listarAnexos);

// Remover anexo (envia o id do anexo no body)
router.delete('/reunioes/:id/anexos', reunioesController.removerAnexo);

module.exports = router;
