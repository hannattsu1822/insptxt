const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Configuração do MySQL
const config = {
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: { rejectUnauthorized: false }
};

// Middlewares
app.use(cors({
  origin: ['https://insptxt-production.up.railway.app', 'http://localhost'],
  methods: ['GET', 'POST']
}));
app.use(express.json());

// 👇 Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota GET /login - Serve o frontend
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota POST /login - Processa o login
app.post('/login', async (req, res) => {
  const { matricula, senha } = req.body;

  if (!matricula || !senha) {
    return res.status(400).json({ 
      success: false,
      message: '⚠️ Preencha todos os campos' 
    });
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE matricula = ? AND senha = ? LIMIT 1',
      [matricula, senha]
    );

    if (rows.length > 0) {
      res.json({ success: true, message: '✅ Login bem-sucedido!' });
    } else {
      res.status(401).json({ success: false, message: '❌ Credenciais inválidas' });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ success: false, message: '🔥 Erro interno' });
  } finally {
    if (connection) await connection.end();
  }
});

// Rota raiz - Redireciona para /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesse: https://insptxt-production.up.railway.app/login`);
});
