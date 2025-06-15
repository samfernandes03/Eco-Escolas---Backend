const { pool } = require('../config/db');

// Obter perfil por ID
async function findPerfilById(id) {
  const [rows] = await pool.query('SELECT ID_Perfil AS id, Nome AS nome FROM perfilutilizador WHERE ID_Perfil = ?', [id]);
  return rows[0]; // undefined se não existir
}

// Atualizar perfil
async function atualizarPerfil(id, nome) {
  const [result] = await pool.query(
    'UPDATE perfilutilizador SET Nome = ? WHERE ID_Perfil = ?',
    [nome, id]
  );
  return result.affectedRows;
}

// Verificar se já existe nome duplicado
async function verificarNomeExistente(nome) {
  const [rows] = await pool.query(
    'SELECT ID_Perfil FROM perfilutilizador WHERE Nome = ?',
    [nome]
  );
  return rows[0];
}

// Verificar se perfil está a ser usado
async function isPerfilEmUso(id) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM utilizador WHERE ID_Perfil = ?',
    [id]
  );
  return rows[0].total > 0;
}

// Eliminar perfil
async function eliminarPerfil(id) {
  const [result] = await pool.query(
    'DELETE FROM perfilutilizador WHERE ID_Perfil = ?',
    [id]
  );
  return result.affectedRows;
}

module.exports = { 
  findPerfilById, 
  atualizarPerfil, 
  verificarNomeExistente,
  isPerfilEmUso,
  eliminarPerfil
};
