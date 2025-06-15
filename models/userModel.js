const { pool } = require('../config/db');

async function findUserByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM utilizador WHERE Nome = ?', [username]);
  return rows[0];
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM utilizador WHERE ID_Utilizador = ?', [id]);
  return rows[0];
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM utilizador WHERE Email = ?', [email]);
  return rows;
}

async function createUser(nome, email, password) {
  await pool.query(
    'INSERT INTO utilizador (Nome, Email, Password, DataRegisto, ID_Perfil) VALUES (?, ?, ?, NOW(), ?)',
    [nome, email, password, 0]
  );
}

async function getPerfilByUserId(id) {
  const [rows] = await pool.query('SELECT ID_Perfil FROM utilizador WHERE ID_Utilizador = ?', [id]);
  return rows[0]; // retorna um objeto { ID_Perfil: 2 } ou undefined
}

module.exports = {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  createUser,
  getPerfilByUserId
};
