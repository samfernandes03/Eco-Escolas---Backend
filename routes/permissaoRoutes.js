const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  criarNovaPermissao,
  listarTodasPermissoes,
  obterPermissaoPorId,
  atualizarPermissaoController,
  eliminarPermissaoController
} = require('../controllers/permissaoController');

router.post('/permissoes', authMiddleware, criarNovaPermissao);
router.get('/permissoes', authMiddleware, listarTodasPermissoes);
router.get('/permissoes/:id', authMiddleware, obterPermissaoPorId);
router.put('/permissoes/:id', authMiddleware, atualizarPermissaoController);
router.delete('/permissoes/:id', authMiddleware, eliminarPermissaoController);

module.exports = router;
