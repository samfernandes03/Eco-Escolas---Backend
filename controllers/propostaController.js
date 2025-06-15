const { pool } = require('../config/db');

// Submeter nova proposta
async function submeterProposta(req, res) {
  try {
    const idUtilizador = req.utilizador.id;
    const { idPlano, nome, areaTematica, recursosNecessarios /*, objetivos removido */ } = req.body;

    if (!idPlano || !nome) {
      return res.status(400).json({ errorMessage: 'Campos obrigatórios em falta ou inválidos.' });
    }

    await pool.query(
      `INSERT INTO propostaatividade (ID_Plano, Nome, AreaTematica, RecursosNecessarios, ID_Utilizador, DataSubmissao, Status) 
       VALUES (?, ?, ?, ?, ?, NOW(), 'Pendente')`,
      [idPlano, nome, areaTematica, recursosNecessarios, idUtilizador]
    );

    res.status(201).json({ message: 'Proposta submetida com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Listar todas as propostas
async function listarPropostas(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT ID_Proposta AS idProposta, Nome AS nome, ID_Plano AS idPlano, DataSubmissao AS dataSubmissao, Status AS status
      FROM propostaatividade
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Obter detalhes de uma proposta
async function obterPropostaPorId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });

  try {
    const [rows] = await pool.query(`
      SELECT ID_Proposta AS idProposta, ID_Plano AS idPlano, ID_Utilizador AS idUtilizador, Nome AS nome, AreaTematica AS areaTematica,
             RecursosNecessarios AS recursosNecessarios, DataSubmissao AS dataSubmissao,
             Status AS status, JustificacaoRejeicao AS justificacaoRejeicao
      FROM propostaatividade
      WHERE ID_Proposta = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ errorMessage: 'Proposta não encontrada.' });

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Aprovar proposta
async function aprovarProposta(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });

  try {
    const [rows] = await pool.query('SELECT * FROM propostaatividade WHERE ID_Proposta = ?', [id]);

    if (rows.length === 0) return res.status(404).json({ errorMessage: 'Proposta não encontrada.' });

    const proposta = rows[0];
    if (proposta.Status !== 'Pendente') {
      return res.status(400).json({ errorMessage: 'A proposta já foi avaliada.' });
    }

    // Criar atividade sem a coluna 'Objetivos'
    await pool.query(`
      INSERT INTO atividade (ID_Plano, Nome, AreaTematica, RecursosNecessarios)
      VALUES (?, ?, ?, ?)
    `, [
      proposta.ID_Plano,
      proposta.Nome,
      proposta.AreaTematica,
      proposta.RecursosNecessarios
    ]);

    await pool.query(`
      UPDATE propostaatividade SET Status = 'Aprovada' WHERE ID_Proposta = ?
    `, [id]);

    res.status(201).json({ message: 'Proposta aprovada e atividade criada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// Rejeitar proposta
async function rejeitarProposta(req, res) {
  const id = parseInt(req.params.id, 10);
  const { justificacao } = req.body;

  if (isNaN(id) || !justificacao) {
    return res.status(400).json({ errorMessage: 'Justificação da rejeição é obrigatória.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM propostaatividade WHERE ID_Proposta = ?', [id]);

    if (rows.length === 0) return res.status(404).json({ errorMessage: 'Proposta não encontrada.' });

    if (rows[0].Status !== 'Pendente') {
      return res.status(400).json({ errorMessage: 'A proposta já foi avaliada.' });
    }

    await pool.query(`
      UPDATE propostaatividade 
      SET Status = 'Rejeitada', JustificacaoRejeicao = ?
      WHERE ID_Proposta = ?
    `, [justificacao, id]);

    res.status(200).json({ message: 'Proposta rejeitada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

module.exports = {
  submeterProposta,
  listarPropostas,
  obterPropostaPorId,
  aprovarProposta,
  rejeitarProposta
};
