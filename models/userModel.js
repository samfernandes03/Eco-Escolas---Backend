// models/userModel.js
const { pool } = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM Utilizador WHERE Email = ?', [email]);
  return rows[0];
}

async function findUserByName(nome) {
  const [rows] = await pool.query('SELECT * FROM Utilizador WHERE Nome = ?', [nome]);
  return rows;
}

async function createUser(nome, email, password, perfilId) {
  const [result] = await pool.query(
    'INSERT INTO Utilizador (Nome, Email, Password, ID_Perfil) VALUES (?, ?, ?, ?)',
    [nome, email, password, perfilId]
  );
  return result.insertId;
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM Utilizador WHERE ID_Utilizador = ?', [id]);
  return rows[0];
}

module.exports = {
  findUserByEmail,
  findUserByName,
  createUser,
  findUserById,
};
