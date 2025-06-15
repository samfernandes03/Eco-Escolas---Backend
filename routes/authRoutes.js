const express = require('express');
const { login, register, getUserById } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/users/:id', getUserById);

module.exports = router;
