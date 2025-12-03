const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/authMiddleware');

// Criar card
router.post('/', auth, async (req, res) => {
  try {
    const { listId, title } = req.body;
    const card = await prisma.card.create({
      data: { listId, title }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar card: ' + error.message });
  }
});

// Atualizar card
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updated = await prisma.card.update({
      where: { id },
      data: { title }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar card: ' + error.message });
  }
});

// DELETE /api/cards/:id - Excluir card
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado' });
    }

    // Valida se pertence ao usuário
    const list = await prisma.list.findUnique({ where: { id: card.listId } });
    const board = await prisma.board.findUnique({ where: { id: list.boardId } });
    if (board.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.card.delete({ where: { id } });

    res.json({ message: 'Card excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir card:', error);
    res.status(500).json({ error: 'Erro ao excluir card' });
  }
});



// PATCH /api/cards/reorder - Reordena cards em uma lista (atualiza positions)
router.patch('/reorder', async (req, res) => {
  const { listId, cards } = req.body;  // cards: [{ id, position }, ...]
  if (!listId || !cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'listId e cards obrigatórios' });
  }

  try {
    // Atualiza todos os cards com novas positions (transação pra atomicidade)
    await prisma.$transaction(
      cards.map((card) =>
        prisma.card.update({
          where: { id: card.id },
          data: { position: card.position },
        })
      )
    );
    res.json({ message: 'Posições atualizadas com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cards/:listId - Lista cards de uma lista (com positions ordenadas)
router.get('/:listId', async (req, res) => {
  const { listId } = req.params;
  try {
    const cards = await prisma.card.findMany({
      where: { listId },
      orderBy: { position: 'asc' },  // Ordena por position
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/cards/move - Move card pra outra lista
router.patch('/move', auth, async (req, res) => {
  const { cardId, targetListId, targetPosition } = req.body;

  try {
    // Atualiza listId e posição
    await prisma.card.update({
      where: { id: cardId },
      data: { listId: targetListId, position: targetPosition || 999 }, // 999 = final da lista
    });

    // Reordena a lista destino (opcional, mas deixa bonitinho)
    const targetCards = await prisma.card.findMany({
      where: { listId: targetListId },
      orderBy: { position: 'asc' },
    });
    await Promise.all(
      targetCards.map((card, index) =>
        prisma.card.update({
          where: { id: card.id },
          data: { position: index },
        })
      )
    );

    res.json({ message: 'Card movido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
