const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Aplica o middleware a todas as rotas daqui
router.use(authMiddleware);

// Criar um novo board
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  try {
    const board = await prisma.board.create({
      data: {
        title,
        description,
        userId: req.user.id, // agora é string (uuid)
      },
    });
    res.status(201).json(board);
  } catch (error) {
    console.error('Erro ao criar board:', error);
    res.status(500).json({ error: 'Erro ao criar board' });
  }
});

// Listar todos os boards do usuário
router.get('/', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.user.id },
    });
    res.json(boards);
  } catch (error) {
    console.error('Erro ao buscar boards:', error);
    res.status(500).json({ error: 'Erro ao buscar boards' });
  }
});

// Atualizar um board
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const board = await prisma.board.updateMany({
      where: { id, userId: req.user.id }, // removido Number(id)
      data: { title, description },
    });

    if (!board.count) {
      return res.status(404).json({ error: 'Board não encontrado' });
    }

    res.json({ message: 'Board atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar board:', error);
    res.status(500).json({ error: 'Erro ao atualizar board' });
  }
});

// Excluir um board e tudo que está dentro dele (listas + cards)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se o board pertence ao usuário
    const board = await prisma.board.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board não encontrado' });
    }

    // Exclui os cards dentro das listas deste board
    await prisma.card.deleteMany({
      where: { list: { boardId: id } },
    });

    // Exclui as listas do board
    await prisma.list.deleteMany({
      where: { boardId: id },
    });

    // Exclui o próprio board
    await prisma.board.delete({
      where: { id },
    });

    res.json({ message: 'Board e conteúdo excluídos com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir board:', error);
    res.status(500).json({ error: 'Erro ao excluir board' });
  }
});

module.exports = router;
