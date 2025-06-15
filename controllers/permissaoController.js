const {
    criarPermissao,
    verificarPermissaoExistente,
    listarPermissoes,
    findPermissaoById,
    atualizarPermissao,
    isPermissaoEmUso,
    eliminarPermissao
  } = require('../models/permissaoModel');
  
  // Criar nova permissão
  async function criarNovaPermissao(req, res) {
    try {
      const { nome } = req.body;
      const utilizadorPerfilId = req.utilizador?.perfilId;
  
      if (!nome || nome.trim() === '') {
        return res.status(400).json({ errorMessage: 'O nome da permissão é obrigatório.' });
      }
  
      if (utilizadorPerfilId !== 1) {
        return res.status(403).json({ errorMessage: 'Acesso negado.' });
      }
  
      const existente = await verificarPermissaoExistente(nome);
      if (existente) {
        return res.status(400).json({ errorMessage: 'O nome da permissão já existe.' });
      }
  
      const id = await criarPermissao(nome);
      res.status(201).json({ id, nome });
    } catch (error) {
      console.error('Erro ao criar permissão:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  // Listar permissões
  async function listarTodasPermissoes(req, res) {
    try {
      const permissoes = await listarPermissoes();
      res.status(200).json(permissoes);
    } catch (error) {
      console.error('Erro ao listar permissões:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  // Obter permissão por ID
  async function obterPermissaoPorId(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const permissao = await findPermissaoById(id);
      if (!permissao) {
        return res.status(404).json({ errorMessage: 'Permissão não encontrada.' });
      }
      res.status(200).json(permissao);
    } catch (error) {
      console.error('Erro ao obter permissão:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  // Atualizar permissão
  async function atualizarPermissaoController(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { nome } = req.body;
  
      if (!nome) {
        return res.status(400).json({ errorMessage: 'O nome é obrigatório.' });
      }
  
      const permissaoExistente = await findPermissaoById(id);
      if (!permissaoExistente) {
        return res.status(404).json({ errorMessage: 'Permissão não encontrada.' });
      }
  
      const duplicado = await verificarPermissaoExistente(nome);
      if (duplicado && duplicado.ID_Permissao !== id) {
        return res.status(400).json({ errorMessage: 'O nome da permissão já existe.' });
      }
  
      await atualizarPermissao(id, nome);
      res.status(200).json({ message: 'Permissão atualizada com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  // Eliminar permissão
  async function eliminarPermissaoController(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const permissao = await findPermissaoById(id);
  
      if (!permissao) {
        return res.status(404).json({ errorMessage: 'Permissão não encontrada.' });
      }
  
      const emUso = await isPermissaoEmUso(id);
      if (emUso) {
        return res.status(409).json({ errorMessage: 'A permissão está associada a perfis e não pode ser eliminada.' });
      }
  
      await eliminarPermissao(id);
      res.status(200).json({ message: 'Permissão eliminada com sucesso.' });
    } catch (error) {
      console.error('Erro ao eliminar permissão:', error);
      res.status(500).json({ errorMessage: 'Erro interno do servidor.' });
    }
  }
  
  module.exports = {
    criarNovaPermissao,
    listarTodasPermissoes,
    obterPermissaoPorId,
    atualizarPermissaoController,
    eliminarPermissaoController
  };
  