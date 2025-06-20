const db = require('../config/db');
const bcrypt = require('bcrypt');
const { getPerfilByUserId } = require('../models/userModel');

async function listarUtilizadores(req, res) {
  try {
    const [rows] = await db.pool.query(`
      SELECT 
        u.ID_Utilizador AS id,
        u.Nome AS nome,
        u.Email AS email,
        u.DataRegisto AS dataRegisto,
        p.ID_Perfil AS perfil_id,
        p.Nome AS perfil_nome
        FROM utilizador u
        LEFT JOIN perfilutilizador p ON u.ID_Perfil = p.ID_Perfil
    `);

    const utilizadores = rows.map(row => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      dataRegisto: row.dataRegisto,
      perfil: row.perfil_id ? {
        id: row.perfil_id,
        nome: row.perfil_nome
      } : { id: null, nome: "Perfil desconhecido" }
    }));

    return res.status(200).json(utilizadores);
  } catch (error) {
    console.error('Erro ao listar utilizadores:', error);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function atualizarUtilizador(req, res) {
  const { id } = req.params;
  const { nome, email, password, idPerfil } = req.body;
  const idAutenticado = req.utilizador.id;
  const perfilAutenticado = req.utilizador.idPerfil;

  try {
    if (parseInt(id) !== idAutenticado) {
      // Se não for admin, bloquear a atualização de outro utilizador
      if (perfilAutenticado !== 2) { // por exemplo, só coordenador pode
        return res.status(403).json({ errorMessage: 'Não tem permissão para alterar este utilizador.' });
      }
    }

    const [rows] = await db.pool.query('SELECT * FROM utilizador WHERE ID_Utilizador = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ errorMessage: 'Utilizador não encontrado.' });
    }

    if (email) {
      const [emailRows] = await db.pool.query(
        'SELECT * FROM utilizador WHERE Email = ? AND ID_Utilizador <> ?',
        [email, id]
      );

      if (emailRows.length > 0) {
        return res.status(400).json({ errorMessage: 'Email já está em uso.' });
      }
    }

    let campos = [];
    let valores = [];

    if (nome) {
      campos.push('Nome = ?');
      valores.push(nome);
    }
    if (email) {
      campos.push('Email = ?');
      valores.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      campos.push('Password = ?');
      valores.push(hashedPassword);
    }
    if (idPerfil && perfilAutenticado === 2) {
      // Só coordenadores podem alterar perfil
      campos.push('ID_Perfil = ?');
      valores.push(idPerfil);
    }

    if (campos.length === 0) {
      return res.status(400).json({ errorMessage: 'Nenhum campo para atualizar.' });
    }

    valores.push(id);

    const query = `UPDATE utilizador SET ${campos.join(', ')} WHERE ID_Utilizador = ?`;
    await db.pool.query(query, valores);

    return res.status(200).json({ message: 'Utilizador atualizado com sucesso.' });

  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}


async function eliminarUtilizador(req, res) {
  const { id } = req.params;
  const idAutenticado = req.utilizador.id;

  try {
    if (parseInt(id) === idAutenticado) {
      return res.status(403).json({ errorMessage: 'Não pode eliminar o seu próprio utilizador.' });
    }

    const perfil = await getPerfilByUserId(idAutenticado);
    if (!perfil || perfil.ID_Perfil !== 2) {
      return res.status(403).json({ errorMessage: 'Apenas coordenadores podem eliminar utilizadores.' });
    }

    const [rows] = await db.pool.query('SELECT * FROM utilizador WHERE ID_Utilizador = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ errorMessage: 'Utilizador não encontrado.' });
    }

    await db.pool.query('DELETE FROM utilizador WHERE ID_Utilizador = ?', [id]);

    return res.status(200).json({ message: 'Utilizador eliminado com sucesso.' });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function obterUtilizadorPorId(req, res) {
  const { id } = req.params;
  const idAutenticado = req.utilizador.id;
  const perfilAutenticado = req.utilizador.idPerfil;

  try {
    // Só coordenadores podem ver outros perfis
    if (parseInt(id) !== idAutenticado && perfilAutenticado !== 2) {
      return res.status(403).json({ errorMessage: 'Sem permissão para aceder a este utilizador.' });
    }

    const [rows] = await db.pool.query(`
      SELECT 
        u.ID_Utilizador AS id,
        u.Nome AS nome,
        u.Email AS email,
        u.DataRegisto AS dataRegisto,
        u.ID_Perfil AS perfil_id,
        p.Nome AS perfil_nome
      FROM utilizador u
      LEFT JOIN perfilutilizador p ON u.ID_Perfil = p.ID_Perfil
      WHERE u.ID_Utilizador = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ errorMessage: 'Utilizador não encontrado.' });
    }

    const row = rows[0];
    const utilizador = {
      id: row.id,
      nome: row.nome,
      email: row.email,
      dataRegisto: row.dataRegisto,
      perfil: {
        id: row.perfil_id,
        nome: row.perfil_nome || 'Desconhecido'
      }
    };

    return res.status(200).json(utilizador);

  } catch (error) {
    console.error('Erro ao obter utilizador por ID:', error);
    return res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

module.exports = {
  listarUtilizadores,
  atualizarUtilizador,
  eliminarUtilizador,
  obterUtilizadorPorId
};
