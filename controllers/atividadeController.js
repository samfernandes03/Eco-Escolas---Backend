const { pool } = require('../config/db');

async function listarAtividades(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.ID_Atividade AS id, a.ID_Plano AS idPlano, a.Nome AS nome, a.AreaTematica AS areaTematica,
             a.DataInicio AS dataInicio, a.DataFim AS dataFim, a.Status AS status,
             u.ID_Utilizador AS responsavelId, u.Nome AS responsavelNome
      FROM atividade a
      LEFT JOIN utilizador u ON a.Responsavel_ID = u.ID_Utilizador
    `);
    const atividades = rows.map(row => ({
      id: row.id,
      idPlano: row.idPlano,
      nome: row.nome,
      areaTematica: row.areaTematica,
      dataInicio: row.dataInicio,
      dataFim: row.dataFim,
      status: row.status,
      responsavel: row.responsavelId ? { id: row.responsavelId, nome: row.responsavelNome } : null
    }));
    res.status(200).json(atividades);
  } catch (error) {
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function criarAtividade(req, res) {
  const { idPlano, nome, areaTematica, dataInicio, dataFim, recursosNecessarios, responsavelId, status } = req.body;
  try {
    if (!idPlano || !nome || !status) {
      return res.status(400).json({ errorMessage: 'Campos obrigatórios em falta.' });
    }
    const [result] = await pool.query(`
      INSERT INTO atividade 
        (ID_Plano, Nome, AreaTematica, DataInicio, DataFim, RecursosNecessarios, Responsavel_ID, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [idPlano, nome, areaTematica || null, dataInicio || null, dataFim || null, recursosNecessarios || null, responsavelId || null, status]);
    res.status(201).json({ id: result.insertId, idPlano, nome, areaTematica, dataInicio, dataFim, recursosNecessarios, responsavelId, status });
  } catch {
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function obterAtividadePorId(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  try {
    const [rows] = await pool.query(`
      SELECT a.ID_Atividade AS id, a.Nome AS nome, a.AreaTematica AS areaTematica,
             a.DataInicio AS dataInicio, a.DataFim AS dataFim, a.RecursosNecessarios AS recursosNecessarios,
             a.Status AS status,
             u.ID_Utilizador AS responsavelId, u.Nome AS responsavelNome
      FROM atividade a
      LEFT JOIN utilizador u ON a.Responsavel_ID = u.ID_Utilizador
      WHERE a.ID_Atividade = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ errorMessage: 'Atividade não encontrada.' });
    const row = rows[0];
    res.status(200).json({
      id: row.id,
      nome: row.nome,
      areaTematica: row.areaTematica,
      dataInicio: row.dataInicio,
      dataFim: row.dataFim,
      recursosNecessarios: row.recursosNecessarios,
      status: row.status,
      responsavel: row.responsavelId ? { id: row.responsavelId, nome: row.responsavelNome } : null
    });
  } catch {
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function atualizarAtividade(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  const { nome, areaTematica, dataInicio, dataFim, recursosNecessarios, responsavelId, status } = req.body;
  try {
    await pool.query(`
      UPDATE atividade SET
        Nome = COALESCE(?, Nome),
        AreaTematica = COALESCE(?, AreaTematica),
        DataInicio = COALESCE(?, DataInicio),
        DataFim = COALESCE(?, DataFim),
        RecursosNecessarios = COALESCE(?, RecursosNecessarios),
        Responsavel_ID = COALESCE(?, Responsavel_ID),
        Status = COALESCE(?, Status)
      WHERE ID_Atividade = ?
    `, [nome, areaTematica, dataInicio, dataFim, recursosNecessarios, responsavelId, status, id]);
    res.status(200).json({ message: 'Atividade atualizada com sucesso.' });
  } catch {
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function eliminarAtividade(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  try {
    const [rows] = await pool.query('SELECT Status FROM atividade WHERE ID_Atividade = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ errorMessage: 'Atividade não encontrada.' });
    const status = rows[0].Status.toLowerCase();
    if (status === 'concluída' || status === 'executada') {
      return res.status(409).json({ errorMessage: 'A atividade já foi executada e não pode ser eliminada.' });
    }
    await pool.query('DELETE FROM atividade WHERE ID_Atividade = ?', [id]);
    res.status(200).json({ message: 'Atividade eliminada com sucesso.' });
  } catch {
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function obterExecucao(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
    try {
      const [rows] = await pool.query(`
        SELECT ID_Execucao AS idExecucao,
               ID_Atividade AS idAtividade,
               Local AS local,
               DataRealizacao AS dataRealizacao,
               ParticipantesEnvolvidos AS participantesEnvolvidos,
               MateriaisUtilizados AS materiaisUtilizados,
               Anotacoes AS anotacoes
        FROM execucaoatividade
        WHERE ID_Atividade = ?
      `, [id]);
      if (rows.length === 0) return res.status(404).json({ errorMessage: 'Execução da atividade não encontrada.' });
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Erro em obterExecucao:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  

  async function registarExecucao(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
    const { local, dataRealizacao, participantesEnvolvidos, materiaisUtilizados, anotacoes, fotos } = req.body;
    try {
      // Verifica se a atividade existe
      const [atividadeRows] = await pool.query('SELECT ID_Atividade FROM atividade WHERE ID_Atividade = ?', [id]);
      if (atividadeRows.length === 0) return res.status(400).json({ errorMessage: 'A atividade especificada não existe.' });
  
      // Verifica se já existe execução para esta atividade
      const [execRows] = await pool.query('SELECT ID_Execucao FROM execucaoatividade WHERE ID_Atividade = ?', [id]);
      if (execRows.length > 0) return res.status(409).json({ errorMessage: 'Execução da atividade já está registada.' });
  
      // Insere nova execução
      await pool.query(`
        INSERT INTO execucaoatividade
          (ID_Atividade, Local, DataRealizacao, ParticipantesEnvolvidos, MateriaisUtilizados, Anotacoes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, local || null, dataRealizacao || null, participantesEnvolvidos || null, materiaisUtilizados || null, anotacoes || null]);
      
  
      res.status(201).json({ message: 'Execução registada com sucesso.' });
    } catch (error) {
      console.error('Erro em registarExecucao:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  

  async function listarInscricoes(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
    try {
      const [atividadeRows] = await pool.query('SELECT ID_Atividade FROM atividade WHERE ID_Atividade = ?', [id]);
      if (atividadeRows.length === 0) return res.status(404).json({ errorMessage: 'Atividade não encontrada.' });
  
      const [rows] = await pool.query(`
        SELECT ID_Inscricao AS id, Nome AS nome, Email AS email, DataInscricao AS dataInscricao
        FROM inscricaoatividade
        WHERE ID_Atividade = ?
        ORDER BY DataInscricao ASC
      `, [id]);
  
      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao listar inscrições:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
async function inscrever(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  
    const { nome, email } = req.body;
    if (!nome || !email) return res.status(400).json({ errorMessage: 'Campos obrigatórios em falta.' });
  
    try {
      // Verifica se a atividade existe
      const [atividadeRows] = await pool.query('SELECT ID_Atividade FROM atividade WHERE ID_Atividade = ?', [id]);
      if (atividadeRows.length === 0) return res.status(404).json({ errorMessage: 'Atividade não encontrada.' });
  
      // Verifica se o participante já está inscrito
      const [inscricaoRows] = await pool.query(
        'SELECT * FROM inscricaoatividade WHERE ID_Atividade = ? AND Email = ?',
        [id, email]
      );
      if (inscricaoRows.length > 0) return res.status(409).json({ errorMessage: 'Participante já inscrito nesta atividade.' });
  
      // Insere a inscrição
      await pool.query(
        'INSERT INTO inscricaoatividade (ID_Atividade, Nome, Email, DataInscricao) VALUES (?, ?, ?, NOW())',
        [id, nome, email]
      );
  
      res.status(201).json({ message: 'Inscrição registada com sucesso.' });
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  

  async function listarAreasTematicasAtividade(req, res) {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
    try {
      const [rows] = await pool.query(`
        SELECT at.ID_AreaTematica AS id, at.Nome AS nome
        FROM atividadeareatematica aat
        JOIN areatematica at ON aat.ID_AreaTematica = at.ID_AreaTematica
        WHERE aat.ID_Atividade = ?
      `, [id]);
      res.status(200).json(rows);
    } catch {
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  async function adicionarAreaTematicaAtividade(req, res) {
    const id = parseInt(req.params.id, 10);
    const { idAreaTematica } = req.body;
    if (isNaN(id) || !idAreaTematica) return res.status(400).json({ errorMessage: 'Dados inválidos.' });
    try {
      // Verificar se a atividade existe
      const [atividadeRows] = await pool.query('SELECT ID_Atividade FROM atividade WHERE ID_Atividade = ?', [id]);
      if (atividadeRows.length === 0) return res.status(404).json({ errorMessage: 'Atividade não encontrada.' });
      
      // Verificar se a área temática existe
      const [areaRows] = await pool.query('SELECT ID_AreaTematica FROM areatematica WHERE ID_AreaTematica = ?', [idAreaTematica]);
      if (areaRows.length === 0) return res.status(404).json({ errorMessage: 'Área temática não encontrada.' });
      
      // Verificar se já está associada
      const [exist] = await pool.query('SELECT * FROM atividadeareatematica WHERE ID_Atividade = ? AND ID_AreaTematica = ?', [id, idAreaTematica]);
      if (exist.length > 0) return res.status(409).json({ errorMessage: 'Área temática já associada à atividade.' });
      
      // Inserir associação
      await pool.query('INSERT INTO atividadeareatematica (ID_Atividade, ID_AreaTematica) VALUES (?, ?)', [id, idAreaTematica]);
      res.status(201).json({ message: 'Área temática adicionada à atividade.' });
    } catch {
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  async function eliminarAreaTematicaAtividade(req, res) {
    const id = parseInt(req.params.id, 10);
    const idAreaTematica = parseInt(req.params.idAreaTematica, 10);
    if (isNaN(id) || isNaN(idAreaTematica)) return res.status(400).json({ errorMessage: 'IDs inválidos.' });
    try {
      const [result] = await pool.query('DELETE FROM atividadeareatematica WHERE ID_Atividade = ? AND ID_AreaTematica = ?', [id, idAreaTematica]);
      if (result.affectedRows === 0) return res.status(404).json({ errorMessage: 'Associação não encontrada.' });
      res.status(200).json({ message: 'Área temática removida da atividade.' });
    } catch {
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  async function listarFotosExecucao(req, res) {
    const id = parseInt(req.params.idExecucao, 10);  // aqui deve ser idExecucao para seguir o teu route
    if (isNaN(id)) return res.status(400).json({ errorMessage: 'ID inválido.' });
  
    try {
      const [rows] = await pool.query(`
        SELECT ID_Foto AS id, NomeFicheiro AS nomeFicheiro, DataInsercao AS dataInsercao
        FROM fotoexecucao
        WHERE ID_Execucao = ?
      `, [id]);
  
      res.status(200).json(rows);
    } catch {
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
    
  async function adicionarFotoExecucao(req, res) {
    const id = parseInt(req.params.idExecucao, 10); // de novo, devemos ir buscar idExecucao
    const { nomeFicheiro } = req.body;
  
    if (isNaN(id) || !nomeFicheiro) return res.status(400).json({ errorMessage: 'Dados inválidos.' });
  
    try {
      // Verificar se a execução existe
      const [execucaoRows] = await pool.query('SELECT ID_Execucao FROM execucaoatividade WHERE ID_Execucao = ?', [id]);
      if (execucaoRows.length === 0) return res.status(404).json({ errorMessage: 'Execução não encontrada.' });
  
      // Inserir foto
      await pool.query('INSERT INTO fotoexecucao (ID_Execucao, NomeFicheiro, DataInsercao) VALUES (?, ?, NOW())', [id, nomeFicheiro]);
      res.status(201).json({ message: 'Foto adicionada à execução.' });
    } catch {
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  async function eliminarFotoExecucao(req, res) {
    const idFoto = parseInt(req.params.idFoto, 10);
  
    if (isNaN(idFoto)) return res.status(400).json({ errorMessage: 'ID da foto inválido.' });
  
    try {
      const [result] = await pool.query('DELETE FROM fotoexecucao WHERE ID_Foto = ?', [idFoto]);
      if (result.affectedRows === 0) return res.status(404).json({ errorMessage: 'Foto não encontrada.' });
  
      res.status(200).json({ message: 'Foto removida com sucesso.' });
    } catch {
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  

module.exports = {
  listarAtividades,
  criarAtividade,
  obterAtividadePorId,
  atualizarAtividade,
  eliminarAtividade,
  obterExecucao,
  registarExecucao,
  listarInscricoes,
  inscrever,
  listarAreasTematicasAtividade,
  adicionarAreaTematicaAtividade,
  eliminarAreaTematicaAtividade,
  listarFotosExecucao,
  adicionarFotoExecucao,
  eliminarFotoExecucao
};
