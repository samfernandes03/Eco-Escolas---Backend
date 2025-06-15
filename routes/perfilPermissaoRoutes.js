const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const {
  listarPermissoesDoPerfil,
  atribuirPermissoesAoPerfil,
  removerPermissaoDoPerfil
} = require('../controllers/perfilPermissaoController');

router.get('/:id/permissoes', autenticar, listarPermissoesDoPerfil);
router.post('/:id/permissoes', autenticar, atribuirPermissoesAoPerfil);
router.delete('/:id/permissoes', autenticar, removerPermissaoDoPerfil);

module.exports = router;
