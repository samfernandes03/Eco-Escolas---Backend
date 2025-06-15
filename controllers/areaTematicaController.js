const { pool } = require('../config/db');

// Listar todas as áreas temáticas
async function listarAreasTematicas(req, res) {
  try {
    const [rows] = await pool.query('SELECT ID_AreaTematica AS id, Nome FROM areatematica ORDER BY Nome ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar áreas temáticas:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Criar nova área temática
async function criarAreaTematica(req, res) {
  const { nome } = req.body;
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ errorMessage: 'Nome da área temática é obrigatório.' });
  }
  try {
    const [exist] = await pool.query('SELECT ID_AreaTematica FROM areatematica WHERE Nome = ?', [nome.trim()]);
    if (exist.length > 0) {
      return res.status(409).json({ errorMessage: 'Área temática já existe.' });
    }
    await pool.query('INSERT INTO areatematica (Nome) VALUES (?)', [nome.trim()]);
    res.status(201).json({ message: 'Área temática criada com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar área temática:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Obter área temática por ID
async function obterAreaTematicaPorId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  try {
    const [rows] = await pool.query('SELECT ID_AreaTematica AS id, Nome FROM areatematica WHERE ID_AreaTematica = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ errorMessage: 'Área temática não encontrada.' });
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao obter área temática:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Atualizar área temática
async function atualizarAreaTematica(req, res) {
  const id = parseInt(req.params.id, 10);
  const { nome } = req.body;
  if (isNaN(id) || !nome || nome.trim() === '') {
    return res.status(400).json({ errorMessage: 'Dados inválidos.' });
  }
  try {
    const [result] = await pool.query('UPDATE areatematica SET Nome = ? WHERE ID_AreaTematica = ?', [nome.trim(), id]);
    if (result.affectedRows === 0) return res.status(404).json({ errorMessage: 'Área temática não encontrada.' });
    res.status(200).json({ message: 'Área temática atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar área temática:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Eliminar área temática
async function eliminarAreaTematica(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  try {
    const [result] = await pool.query('DELETE FROM areatematica WHERE ID_AreaTematica = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ errorMessage: 'Área temática não encontrada.' });
    res.status(200).json({ message: 'Área temática eliminada com sucesso.' });
  } catch (error) {
    console.error('Erro ao eliminar área temática:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

module.exports = {
  listarAreasTematicas,
  criarAreaTematica,
  obterAreaTematicaPorId,
  atualizarAreaTematica,
  eliminarAreaTematica
};
