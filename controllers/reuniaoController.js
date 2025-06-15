const { pool } = require('../config/db');

// Listar todas as reuniões
async function listarReunioes(req, res) {
  try {
    const { idProjeto } = req.query;

    let query = `
      SELECT ID_Reuniao AS idReuniao, ID_Projeto AS idProjeto, DataHora AS dataHora, Local AS local,
             Pauta AS pauta, Ata AS ata, DataRegistoAta AS dataRegistroAta
      FROM reuniao
    `;

    const params = [];

    if (idProjeto) {
      query += ' WHERE ID_Projeto = ?';
      params.push(idProjeto);
    }

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

function formatDateTimeForMySQL(dateTimeString) {
  if (!dateTimeString) return null;
  return dateTimeString.replace('T', ' ').replace('Z', '');
}

async function criarReuniao(req, res) {
  try {
    const { idProjeto, dataHora, local, pauta, ata, dataRegistroAta } = req.body;

    if (!idProjeto || !dataHora || !local) {
      return res.status(400).json({ errorMessage: 'Campos obrigatórios em falta ou inválidos.' });
    }

    const dataHoraFormatada = formatDateTimeForMySQL(dataHora);
    const dataRegistroAtaFormatada = formatDateTimeForMySQL(dataRegistroAta);

    await pool.query(`
      INSERT INTO reuniao (ID_Projeto, DataHora, Local, Pauta, Ata, DataRegistoAta)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [idProjeto, dataHoraFormatada, local, pauta || null, ata || null, dataRegistroAtaFormatada]
    );

    res.status(201).json({ message: 'Reunião criada com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function verDetalhesReuniao(req, res) {
  try {
    const idReuniao = req.params.id;

    const [rows] = await pool.query(`
      SELECT ID_Reuniao AS idReuniao, ID_Projeto AS idProjeto, DataHora AS dataHora, Local AS local,
             Pauta AS pauta, Ata AS ata, DataRegistoAta AS dataRegistroAta
      FROM reuniao
      WHERE ID_Reuniao = ?
    `, [idReuniao]);

    if (rows.length === 0) {
      return res.status(404).json({ errorMessage: "Reunião não encontrada." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Erro interno do servidor." });
  }
}

// ADICIONAR ANEXO
async function adicionarAnexo(req, res) {
    try {
      const idReuniao = parseInt(req.params.id, 10);
      const { nomeFicheiro, caminhoFicheiro, dataUpload } = req.body;
  
      if (isNaN(idReuniao)) return res.status(400).json({ errorMessage: 'ID inválido.' });
      if (!nomeFicheiro || !caminhoFicheiro || !dataUpload) {
        return res.status(400).json({ errorMessage: 'Falha ao adicionar o anexo. Campos obrigatórios não preenchidos.' });
      }
  
      const [reuniaoRows] = await pool.query('SELECT 1 FROM reuniao WHERE ID_Reuniao = ?', [idReuniao]);
      if (reuniaoRows.length === 0) {
        return res.status(404).json({ errorMessage: 'Reunião não encontrada.' });
      }
  
      // Aqui está o truque:
      const dataUploadFormatada = formatDateTimeForMySQL(dataUpload);
  
      await pool.query(`
        INSERT INTO anexoreuniao (ID_Reuniao, NomeFicheiro, CaminhoFicheiro, DataUpload)
        VALUES (?, ?, ?, ?)`,
        [idReuniao, nomeFicheiro, caminhoFicheiro, dataUploadFormatada]
      );
  
      res.status(201).json({ message: 'Anexo adicionado com sucesso.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  

// LISTAR ANEXOS
async function listarAnexos(req, res) {
  const idReuniao = parseInt(req.params.id, 10);
  if (isNaN(idReuniao)) return res.status(400).json({ errorMessage: 'ID inválido.' });

  try {
    const [reuniaoRows] = await pool.query('SELECT 1 FROM reuniao WHERE ID_Reuniao = ?', [idReuniao]);
    if (reuniaoRows.length === 0) {
      return res.status(404).json({ errorMessage: 'Reunião não encontrada.' });
    }

    const [anexos] = await pool.query(`
      SELECT ID_Anexo AS idAnexo, ID_Reuniao AS idReuniao, NomeFicheiro AS nomeFicheiro, CaminhoFicheiro AS caminhoFicheiro, DataUpload AS dataUpload
      FROM anexoreuniao
      WHERE ID_Reuniao = ?`,
      [idReuniao]
    );

    res.status(200).json(anexos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

// REMOVER ANEXO
async function removerAnexo(req, res) {
  try {
    const idReuniao = parseInt(req.params.id, 10);
    const { idAnexo } = req.body;

    if (isNaN(idReuniao) || !idAnexo) {
      return res.status(400).json({ errorMessage: 'ID da reunião e do anexo são obrigatórios.' });
    }

    const [reuniaoRows] = await pool.query('SELECT 1 FROM reuniao WHERE ID_Reuniao = ?', [idReuniao]);
    if (reuniaoRows.length === 0) {
      return res.status(404).json({ errorMessage: 'Reunião não encontrada.' });
    }

    const [anexoRows] = await pool.query('SELECT 1 FROM anexoreuniao WHERE ID_Anexo = ? AND ID_Reuniao = ?', [idAnexo, idReuniao]);
    if (anexoRows.length === 0) {
      return res.status(404).json({ errorMessage: 'Anexo não encontrado para esta reunião.' });
    }

    await pool.query('DELETE FROM anexoreuniao WHERE ID_Anexo = ?', [idAnexo]);

    res.status(200).json({ message: 'Anexo removido com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
  }
}

async function listarReunioesPorProjeto(req, res) {
    const { id } = req.params;
  
    try {
      const [rows] = await pool.query(
        'SELECT ID_Reuniao AS id, DataHora AS dataHora, Local AS local, Pauta AS pauta FROM reuniao WHERE ID_Projeto = ?',
        [id]
      );
  
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ errorMessage: 'Erro ao obter reuniões do projeto.' });
    }
  }
  
  
async function adicionarReuniao(req, res){
    const { id } = req.params;
    const { dataHora, local, pauta } = req.body;
  
    if (!dataHora || !local) {
      return res.status(400).json({ errorMessage: 'Campos obrigatórios não preenchidos.' });
    }
  
    try {
      await pool.query(
        'INSERT INTO reuniao (ID_Projeto, DataHora, Local, Pauta) VALUES (?, ?, ?, ?)',
        [id, dataHora.replace('T', ' ').replace('Z', ''), local, pauta || null]
      );
  
      res.status(201).json({ message: 'Reunião criada com sucesso.' });
    } catch (err) {
      res.status(500).json({ errorMessage: 'Erro ao criar reunião.' });
    }
  };
  
async function removerReuniao(req, res) {
    const { id, idReuniao } = req.params;
  
    try {
      const [result] = await pool.query(
        'DELETE FROM reuniao WHERE ID_Projeto = ? AND ID_Reuniao = ?',
        [id, idReuniao]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ errorMessage: 'Reunião não encontrada para o projeto.' });
      }
  
      res.status(200).json({ message: 'Reunião removida com sucesso.' });
    } catch (err) {
      res.status(500).json({ errorMessage: 'Erro ao remover reunião.' });
    }
  };
  
async function editarReuniao(req, res) {
    const { id, idReuniao } = req.params;
    const { dataHora, local, pauta } = req.body;
  
    try {
      const [result] = await pool.query(
        `UPDATE reuniao SET DataHora = ?, Local = ?, Pauta = ? 
         WHERE ID_Projeto = ? AND ID_Reuniao = ?`,
        [dataHora.replace('T', ' ').replace('Z', ''), local, pauta || null, id, idReuniao]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ errorMessage: 'Reunião não encontrada.' });
      }
  
      res.status(200).json({ message: 'Reunião atualizada com sucesso.' });
    } catch (err) {
      res.status(500).json({ errorMessage: 'Erro ao editar reunião.' });
    }
  };
  

module.exports = {
  listarReunioes,
  criarReuniao,
  verDetalhesReuniao,
  adicionarAnexo,
  listarAnexos,
  removerAnexo,
  listarReunioesPorProjeto,
  adicionarReuniao,
  removerReuniao,
  editarReuniao,
};
