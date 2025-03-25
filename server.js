const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir arquivos estáticos (HTML, CSS, JS)

// Configuração do banco de dados
const config = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: { rejectUnauthorized: false }
};

// Rota principal (opcional, já serve index.html automaticamente)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de login
app.post('/login', async (req, res) => {
  const { matricula, senha } = req.body;
  if (!matricula || !senha) {
    return res.status(400).json({ message: 'Campos obrigatórios' });
  }

  let conexao;
  try {
    conexao = await mysql.createConnection(config);
    const [rows] = await conexao.execute(
      'SELECT * FROM users WHERE matricula = ? AND senha = ?',
      [matricula, senha]
    );

    if (rows.length > 0) {
      res.json({ message: 'Login ok' });
    } else {
      res.status(401).json({ message: 'Matrícula ou senha inválida' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor', error: err.message });
  } finally {
    if (conexao) await conexao.end();
  }
});

// Subir servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
