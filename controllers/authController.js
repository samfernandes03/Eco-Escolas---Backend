const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');
const { findUserByUsername, findUserById, findUserByEmail, createUser } = require('../models/userModel');

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ errorMessage: 'Username e password são obrigatórios.' });

  try {
    const user = await findUserByUsername(username);
    if (!user || user.Password !== password)
      return res.status(401).json({ errorMessage: 'Credenciais inválidas.' });

    const payload = { 
      username: user.Nome, 
      id: user.ID_Utilizador,
      perfilId: user.ID_Perfil
    };
    const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
    
    res.status(200).json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function register(req, res) {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password)
    return res.status(400).json({ errorMessage: 'Todos os campos são obrigatórios.' });

  try {
    const existing = await findUserByEmail(email);
    if (existing.length > 0)
      return res.status(409).json({ errorMessage: 'Email já registado.' });

    await createUser(nome, email, password);
    res.status(201).json({ message: 'Utilizador registado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: 'Erro ao registar utilizador.' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await findUserById(req.params.id);
    if (!user)
      return res.status(404).json({ errorMessage: 'Utilizador não encontrado.' });

    const { Password, ...userData } = user;
    res.status(200).json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMessage: 'Erro ao obter utilizador.' });
  }
}

module.exports = { login, register, getUserById };


