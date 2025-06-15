const { pool } = require('../config/db');

// Criar nova permissão
async function criarPermissao(nome) {
  const [result] = await pool.query(
    'INSERT INTO permissao (Nome) VALUES (?)',
    [nome]
  );
  return result.insertId;
}

// Verificar se o nome já existe
async function verificarPermissaoExistente(nome) {
  const [rows] = await pool.query(
    'SELECT ID_Permissao FROM permissao WHERE Nome = ?',
    [nome]
  );
  return rows[0];
}

// Listar todas as permissões
async function listarPermissoes() {
  const [rows] = await pool.query(
    'SELECT ID_Permissao AS id, Nome AS nome FROM permissao ORDER BY ID_Permissao'
  );
  return rows;
}

// Obter permissão por ID
async function findPermissaoById(id) {
  const [rows] = await pool.query(
    'SELECT ID_Permissao AS id, Nome AS nome FROM permissao WHERE ID_Permissao = ?',
    [id]
  );
  return rows[0];
}

// Atualizar permissão
async function atualizarPermissao(id, nome) {
  const [result] = await pool.query(
    'UPDATE permissao SET Nome = ? WHERE ID_Permissao = ?',
    [nome, id]
  );
  return result.affectedRows;
}

async function isPermissaoEmUso(idPermissao) {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM perfilpermissao WHERE ID_Permissao = ?', [idPermissao]);
    return rows[0].total > 0;
  }
  

// Eliminar permissão
async function eliminarPermissao(id) {
  const [result] = await pool.query(
    'DELETE FROM permissao WHERE ID_Permissao = ?',
    [id]
  );
  return result.affectedRows;
}

module.exports = {
  criarPermissao,
  verificarPermissaoExistente,
  listarPermissoes,
  findPermissaoById,
  atualizarPermissao,
  isPermissaoEmUso,
  eliminarPermissao
};
