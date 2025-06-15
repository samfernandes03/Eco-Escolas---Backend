const { pool } = require('../config/db');

// Listar todos os projetos
async function listarProjetos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.ID_Projeto AS id, p.Nome AS nome, p.PeriodoVigenciainicio, p.PeriodoVigenciaFim,
              p.ObjetivosGerais, p.NivelProjeto, 
              u.ID_Utilizador AS coordenadorId, u.Nome AS coordenadorNome
       FROM projetoanual p
       LEFT JOIN utilizador u ON p.ID_Coordenador = u.ID_Utilizador`
    );

    const projetos = rows.map(row => ({
      id: row.id,
      nome: row.nome,
      periodoVigenciaInicio: row.PeriodoVigenciainicio,
      periodoVigenciaFim: row.PeriodoVigenciaFim,
      objetivosGerais: row.ObjetivosGerais,
      nivelProjeto: row.NivelProjeto,
      coordenador: row.coordenadorId ? { id: row.coordenadorId, nome: row.coordenadorNome } : null
    }));

    res.status(200).json(projetos);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function obterProjetoPorId(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID do projeto inválido' });
      }
  
      const [rows] = await pool.query(`
        SELECT p.ID_Projeto AS id, p.Nome AS nome, p.PeriodoVigenciainicio, p.PeriodoVigenciaFim,
               p.ObjetivosGerais, p.NivelProjeto, 
               u.ID_Utilizador AS coordenadorId, u.Nome AS coordenadorNome
        FROM projetoanual p
        LEFT JOIN utilizador u ON p.ID_Coordenador = u.ID_Utilizador
        WHERE p.ID_Projeto = ?
      `, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Projeto não encontrado.' });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error('Erro ao obter projeto:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
  

// Criar projeto
async function criarProjeto(req, res) {
  const { nome, periodoVigenciaInicio, periodoVigenciaFim, objetivosGerais, nivelProjeto, idCoordenador } = req.body;

  try {
    // Verificar duplicação de nome
    const [existente] = await pool.query(
      'SELECT ID_Projeto FROM projetoanual WHERE Nome = ?',
      [nome]
    );

    if (existente.length > 0) {
      return res.status(400).json({ errorMessage: 'Já existe um projeto com esse nome.' });
    }

    const [result] = await pool.query(
      `INSERT INTO projetoanual (Nome, PeriodoVigenciainicio, PeriodoVigenciaFim, ObjetivosGerais, NivelProjeto, ID_Coordenador)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, periodoVigenciaInicio, periodoVigenciaFim, objetivosGerais || null, nivelProjeto || null, idCoordenador || null]
    );

    const projetoCriado = {
      id: result.insertId,
      nome,
      periodoVigenciaInicio,
      periodoVigenciaFim,
      objetivosGerais,
      nivelProjeto,
      idCoordenador
    };

    res.status(201).json(projetoCriado);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Atualizar projeto
async function atualizarProjeto(req, res) {
  const id = parseInt(req.params.id, 10);
  const { nome, periodoVigenciaInicio, periodoVigenciaFim, objetivosGerais, nivelProjeto, idCoordenador } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE projetoanual SET 
        Nome = COALESCE(?, Nome),
        PeriodoVigenciainicio = COALESCE(?, PeriodoVigenciainicio),
        PeriodoVigenciaFim = COALESCE(?, PeriodoVigenciaFim),
        ObjetivosGerais = COALESCE(?, ObjetivosGerais),
        NivelProjeto = COALESCE(?, NivelProjeto),
        ID_Coordenador = COALESCE(?, ID_Coordenador)
       WHERE ID_Projeto = ?`,
      [nome, periodoVigenciaInicio, periodoVigenciaFim, objetivosGerais, nivelProjeto, idCoordenador, id]
    );

    res.status(200).json({ message: 'Projeto atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Eliminar projeto
async function eliminarProjeto(req, res) {
  const id = parseInt(req.params.id, 10);

  try {
    // Aqui podias verificar dependências se necessário

    await pool.query('DELETE FROM projetoanual WHERE ID_Projeto = ?', [id]);

    res.status(200).json({ message: 'Projeto eliminado com sucesso.' });
  } catch (error) {
    console.error('Erro ao eliminar projeto:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// GET /projetos/:id/coordenador
const obterCoordenador = async (req, res) => {
  const { id } = req.params;

  try {
    const [projetoRows] = await pool.query(
      'SELECT ID_Coordenador FROM projetoanual WHERE ID_Projeto = ?',
      [id]
    );

    if (projetoRows.length === 0 || !projetoRows[0].ID_Coordenador) {
      return res.status(404).json({ errorMessage: 'Projeto não encontrado ou sem coordenador atribuído.' });
    }

    const idCoordenador = projetoRows[0].ID_Coordenador;

    const [utilizadorRows] = await pool.query(
      `SELECT u.ID_Utilizador AS id, u.Nome AS nome, u.Email AS email, p.Nome AS perfil
        FROM utilizador u
        JOIN perfilutilizador p ON u.ID_Perfil = p.ID_Perfil
        WHERE u.ID_Utilizador = ?
        `,
      [idCoordenador]
    );

    if (utilizadorRows.length === 0) {
      return res.status(404).json({ errorMessage: 'Coordenador não encontrado.' });
    }

    res.json(utilizadorRows[0]);

  } catch (error) {
    console.error('Erro ao obter coordenador:', error);
    res.status(500).json({ errorMessage: 'Erro ao obter coordenador.' });
  }
};

// PUT /projetos/:id/coordenador
const atualizarCoordenador = async (req, res) => {
  const { id } = req.params;
  const { idCoordenador } = req.body;

  try {
    // Verifica se o utilizador existe
    const [utilizadorRows] = await pool.query(
      'SELECT * FROM utilizador WHERE ID_Utilizador = ?',
      [idCoordenador]
    );

    if (utilizadorRows.length === 0) {
      return res.status(404).json({ errorMessage: 'Utilizador não encontrado.' });
    }

    // Verifica se o projeto existe
    const [projetoRows] = await pool.query(
      'SELECT * FROM projetoanual WHERE ID_Projeto = ?',
      [id]
    );

    if (projetoRows.length === 0) {
      return res.status(404).json({ errorMessage: 'Projeto não encontrado.' });
    }

    // Atualiza o coordenador
    await pool.query(
      'UPDATE projetoanual SET ID_Coordenador = ? WHERE ID_Projeto = ?',
      [idCoordenador, id]
    );

    res.json({ message: 'Coordenador atualizado com sucesso.' });

  } catch (error) {
    console.error('Erro ao atualizar coordenador:', error);
    res.status(500).json({ errorMessage: 'Erro ao atualizar coordenador.' });
  }
};


module.exports = {
  listarProjetos,
  obterProjetoPorId,
  criarProjeto,
  atualizarProjeto,
  eliminarProjeto,
  obterCoordenador,
  atualizarCoordenador,
};
