require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rotas de autenticação
app.use('/api/auth', require('./routes/auth'));

// Rota de health check (testa API + DB)
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();  // Tenta conectar no DB
    const usersCount = await prisma.user.count();  // Conta usuários (deve ser 0)
    res.json({ 
      status: 'API OrgaTasks rodando! 🎊', 
      dbConnected: true, 
      usersCount: usersCount 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Falha na conexão: ' + error.message 
    });
  } finally {
    await prisma.$disconnect();  // Fecha conexão pra não vazar
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});