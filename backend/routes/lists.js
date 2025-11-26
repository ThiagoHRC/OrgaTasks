const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/authMiddleware');

// Criar nova lista
router.post('/', auth, async (req, res) => {
  try {
    const { boardId, title } = req.body;
    const list = await prisma.list.create({
      data: { boardId, title }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar lista: ' + error.message });
  }
});

// Buscar listas de um quadro (com cards incluídos)
router.get('/:boardId', auth, async (req, res) => {
  try {
    const { boardId } = req.params;
    const lists = await prisma.list.findMany({
      where: { boardId },
      include: { cards: true }
    });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar listas: ' + error.message });
  }
});

// Atualizar lista
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updated = await prisma.list.update({
      where: { id },
      data: { title }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar lista: ' + error.message });
  }
});

// DELETE /api/lists/:id - Excluir lista
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // se usa authMiddleware
  try {
    // Antes de deletar, verifica se a lista existe
    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) {
      return res.status(404).json({ error: 'Lista não encontrada' });
    }

    // Verifica se pertence ao usuário logado
    const board = await prisma.board.findUnique({
      where: { id: list.boardId },
    });
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Deleta todos os cards relacionados primeiro (para evitar erro de FK)
    await prisma.card.deleteMany({ where: { listId: id } });

    // Agora deleta a lista
    await prisma.list.delete({ where: { id } });

    res.json({ message: 'Lista excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lista:', error);
    res.status(500).json({ error: 'Erro ao excluir lista' });
  }
});


module.exports = router;
