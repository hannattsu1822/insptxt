const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Config do banco
const config = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: { rejectUnauthorized: false }
};

app.use(cors());
app.use(express.json());

// Rota de login (mantemos a original)
app.post('/login', async (req, res) => {
  const { matricula, senha } = req.body;

  if (!matricula || !senha) {
    return res.status(400).json({ message: 'Matrícula e senha são obrigatórias' });
  }

  let conexao;
  try {
    conexao = await mysql.createConnection(config);
    const [rows] = await conexao.execute(
      'SELECT * FROM users WHERE matricula = ? AND senha = ?',
      [matricula, senha]
    );

    if (rows.length > 0) {
      // Adicionamos o nome do usuário na resposta
      return res.json({ 
        message: 'Login bem-sucedido',
        user: {
          nome: rows[0].nome || 'Usuário', // assumindo que existe campo 'nome'
          matricula: rows[0].matricula
        }
      });
    } else {
      return res.status(401).json({ message: 'Matrícula ou senha inválidos' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Erro no servidor', error: err.message });
  } finally {
    if (conexao) await conexao.end();
  }
});

// Nova rota para dados do dashboard (simplificada)
app.get('/dashboard-data', async (req, res) => {
  let conexao;
  try {
    conexao = await mysql.createConnection(config);
    // Exemplo: busca os últimos 5 registros de uma tabela
    const [data] = await conexao.execute('SELECT * FROM sua_tabela LIMIT 5');
    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar dados', error: err.message });
  } finally {
    if (conexao) await conexao.end();
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
