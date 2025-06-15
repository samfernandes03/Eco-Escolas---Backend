const { pool } = require('../config/db');

// Listar todos os planos
async function listarPlanos(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT ID_Plano AS id, ID_Projeto AS idProjeto, Nome AS nome, Ano AS ano
      FROM planoatividades
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Obter plano por ID
async function obterPlanoPorId(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ errorMessage: 'ID inválido.' });
    }

    const [rows] = await pool.query(`
      SELECT ID_Plano AS id, ID_Projeto AS idProjeto, Nome AS nome, Ano AS ano
      FROM planoatividades
      WHERE ID_Plano = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ errorMessage: 'Plano não encontrado.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao obter plano:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Criar plano
async function criarPlano(req, res) {
  try {
    const { idProjeto, nome, ano } = req.body;

    if (!idProjeto || !nome?.trim() || !ano) {
      return res.status(400).json({ errorMessage: 'idProjeto, nome e ano são obrigatórios.' });
    }

    const [existente] = await pool.query(`
      SELECT ID_Plano FROM planoatividades WHERE ID_Projeto = ? AND Nome = ?
    `, [idProjeto, nome]);

    if (existente.length > 0) {
      return res.status(400).json({ errorMessage: 'Já existe um plano com esse nome para este projeto.' });
    }

    const [result] = await pool.query(`
      INSERT INTO planoatividades (ID_Projeto, Nome, Ano)
      VALUES (?, ?, ?)
    `, [idProjeto, nome, ano]);

    res.status(201).json({
      id: result.insertId,
      idProjeto,
      nome,
      ano
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Atualizar plano
async function atualizarPlano(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { idProjeto, nome, ano } = req.body;

    const [planoAtual] = await pool.query(`
      SELECT * FROM planoatividades WHERE ID_Plano = ?
    `, [id]);

    if (planoAtual.length === 0) {
      return res.status(404).json({ errorMessage: 'Plano não encontrado.' });
    }

    const projetoAtual = idProjeto || planoAtual[0].ID_Projeto;
    const nomeAtual = nome || planoAtual[0].Nome;

    if (nome || idProjeto) {
      const [existeNome] = await pool.query(`
        SELECT ID_Plano FROM planoatividades
        WHERE Nome = ? AND ID_Projeto = ? AND ID_Plano != ?
      `, [nomeAtual, projetoAtual, id]);

      if (existeNome.length > 0) {
        return res.status(400).json({ errorMessage: 'Já existe um plano com esse nome para este projeto.' });
      }
    }

    await pool.query(`
      UPDATE planoatividades SET
        ID_Projeto = COALESCE(?, ID_Projeto),
        Nome = COALESCE(?, Nome),
        Ano = COALESCE(?, Ano)
      WHERE ID_Plano = ?
    `, [idProjeto, nome, ano, id]);

    res.status(200).json({ message: 'Plano atualizado com sucesso.' });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Eliminar plano
async function eliminarPlano(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    // Validar se existem atividades associadas
    const [atividades] = await pool.query(`
      SELECT ID_Atividade FROM atividade WHERE ID_Plano = ?
    `, [id]);

    if (atividades.length > 0) {
      return res.status(409).json({
        errorMessage: 'Plano tem atividades associadas e não pode ser eliminado.'
      });
    }

    await pool.query(`
      DELETE FROM planoatividades WHERE ID_Plano = ?
    `, [id]);

    res.status(200).json({ message: 'Plano eliminado com sucesso.' });

  } catch (error) {
    console.error('Erro ao eliminar plano:', error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Listar planos de um projeto específico
async function listarPlanosPorProjeto(req, res) {
    try {
      const idProjeto = parseInt(req.params.id, 10);
      if (isNaN(idProjeto)) {
        return res.status(400).json({ errorMessage: 'ID do projeto inválido.' });
      }
  
      // Primeiro, verificar se o projeto existe
      const [projeto] = await pool.query(`
        SELECT ID_Projeto FROM projetoanual WHERE ID_Projeto = ?
      `, [idProjeto]);
  
      if (projeto.length === 0) {
        return res.status(404).json({ errorMessage: 'Projeto não encontrado.' });
      }
  
      // Buscar os planos associados ao projeto
      const [planos] = await pool.query(`
        SELECT ID_Plano AS id, Nome AS nome, Ano AS ano
        FROM planoatividades
        WHERE ID_Projeto = ?
      `, [idProjeto]);
  
      res.status(200).json(planos);
    } catch (error) {
      console.error('Erro ao listar planos por projeto:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  

module.exports = {
  listarPlanos,
  obterPlanoPorId,
  criarPlano,
  atualizarPlano,
  eliminarPlano,
  listarPlanosPorProjeto
};
