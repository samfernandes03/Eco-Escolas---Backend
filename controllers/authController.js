const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwtConfig = require('../config/jwtConfig');
const {
  findUserByEmail,
  findUserByName,
  createUser,
  findUserById
} = require('../models/userModel');

const SALT_ROUNDS = 10;

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ errorMessage: 'Email e password são obrigatórios.' });

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ errorMessage: 'Credenciais inválidas.' });
    }

    if (!user.Password) {
      return res.status(401).json({ errorMessage: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) {
      return res.status(401).json({ errorMessage: 'Credenciais inválidas.' });
    }

    const payload = {
      username: user.Nome,
      id: user.ID_Utilizador,
      perfilId: user.ID_Perfil
    };
    const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    return res.status(200).json({ accessToken: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function register(req, res) {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ errorMessage: 'Todos os campos são obrigatórios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ errorMessage: 'Formato de email inválido.' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      errorMessage:
        'A password deve ter pelo menos 8 caracteres, incluindo uma maiúscula, uma minúscula, um número e um símbolo.'
    });
  }

  try {
    const emailExists = await findUserByEmail(email);
    if (emailExists) {
      return res.status(409).json({ errorMessage: 'Email já registado.' });
    }

    const nameExists = await findUserByName(nome);
    if (nameExists.length > 0) {
      return res.status(409).json({ errorMessage: 'Nome de utilizador já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await createUser(nome, email, hashedPassword, 1);

    return res.status(201).json({ message: 'Utilizador registado com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorMessage: 'Erro ao registar utilizador.' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ errorMessage: 'Utilizador não encontrado.' });
    }

    const { Password, ...userData } = user;
    return res.status(200).json(userData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errorMessage: 'Erro ao obter utilizador.' });
  }
}

module.exports = { login, register, getUserById };
