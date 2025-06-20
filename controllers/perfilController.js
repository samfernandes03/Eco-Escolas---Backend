const db = require('../config/db');
const { atualizarPerfil, verificarNomeExistente, findPerfilById, isPerfilEmUso, eliminarPerfil } = require('../models/perfilModel');

// Listar todos os perfis
async function listarPerfis(req, res) {
  try {
    const [rows] = await db.pool.query('SELECT ID_Perfil AS id, Nome AS nome FROM perfilutilizador ORDER BY ID_Perfil');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Criar novo perfil
async function criarPerfil(req, res) {
  const { nome } = req.body;
  const utilizadorPerfilId = req.utilizador?.perfilId; // assumindo que guardamos no token

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ errorMessage: 'O nome do perfil é obrigatório.' });
  }

  if (utilizadorPerfilId !== 1) {
    return res.status(403).json({ errorMessage: 'Acesso negado.' });
  }

  try {
    const [existentes] = await db.pool.query(
      'SELECT * FROM perfilutilizador WHERE Nome = ?',
      [nome]
    );

    if (existentes.length > 0) {
      return res.status(400).json({ errorMessage: 'O nome do perfil já existe.' });
    }

    const [result] = await db.pool.query(
      'INSERT INTO perfilutilizador (Nome) VALUES (?)',
      [nome]
    );

    return res.status(201).json({ id: result.insertId, nome });
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Obter perfil por ID
async function getPerfilById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ errorMessage: 'ID inválido.' });
    }

    const perfil = await findPerfilById(id);
    if (!perfil) {
      return res.status(404).json({ errorMessage: 'Perfil não encontrado.' });
    }

    res.status(200).json(perfil);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Atualizar perfil
// Atualizar perfil
async function updatePerfil(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ errorMessage: 'ID inválido.' });
    }

    const { nome } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ errorMessage: 'O nome é obrigatório.' });
    }

    const perfilExistente = await findPerfilById(id);
    if (!perfilExistente) {
      return res.status(404).json({ errorMessage: 'Perfil não encontrado.' });
    }

    const nomeDuplicado = await verificarNomeExistente(nome.trim());
    if (nomeDuplicado && nomeDuplicado.ID_Perfil !== id) {
      return res.status(400).json({ errorMessage: 'O nome do perfil já existe.' });
    }

    const linhasAfetadas = await atualizarPerfil(id, nome.trim());
    if (linhasAfetadas === 0) {
      return res.status(404).json({ errorMessage: 'Perfil não encontrado.' });
    }

    res.status(200).json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}


// Eliminar perfil
async function deletePerfil(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ errorMessage: 'ID inválido.' });
    }

    const perfil = await findPerfilById(id);
    if (!perfil) {
      return res.status(404).json({ errorMessage: 'Perfil não encontrado.' });
    }

    const emUso = await isPerfilEmUso(id);
    if (emUso) {
      return res.status(409).json({ errorMessage: 'O perfil está associado a utilizadores e não pode ser eliminado.' });
    }

    await eliminarPerfil(id);
    res.status(200).json({ message: 'Perfil eliminado com sucesso.' });

  } catch (error) {
    console.error('Erro ao eliminar perfil:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

module.exports = { listarPerfis, criarPerfil, getPerfilById, updatePerfil, deletePerfil };
