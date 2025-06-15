const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { listarPerfis, criarPerfil, getPerfilById, updatePerfil, deletePerfil } = require('../controllers/perfilController');

router.get('/perfis', authMiddleware, listarPerfis);
router.post('/perfis', authMiddleware, criarPerfil);
router.get('/perfis/:id', authMiddleware, getPerfilById);
router.put('/perfis/:id', authMiddleware, updatePerfil);
router.delete('/perfis/:id', authMiddleware, deletePerfil);

module.exports = router;
