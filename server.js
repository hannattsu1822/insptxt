const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do MySQL (usando sua URL do Railway)
const config = {
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: { rejectUnauthorized: false }
};

// Configuração do CORS (liberando acesso do frontend)
app.use(cors({
  origin: ['https://insptxt-production.up.railway.app', 'http://localhost'],
  methods: ['GET', 'POST']
}));

app.use(express.json());

// 👇 Rota raiz para evitar o erro "Cannot GET /"
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Backend Online</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #4CAF50; }
          a { color: #2196F3; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>🚀 Backend está online!</h1>
        <p>Use o endpoint <code>/login</code> para autenticação.</p>
        <p>Acesse o <a href="/login" target="_blank">Frontend de Login</a></p>
      </body>
    </html>
  `);
});

// Rota de login (POST)
app.post('/login', async (req, res) => {
  const { matricula, senha } = req.body;

  if (!matricula || !senha) {
    return res.status(400).json({ 
      success: false,
      message: '⚠️ Preencha matrícula e senha!' 
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
