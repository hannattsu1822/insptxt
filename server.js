const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: { rejectUnauthorized: false }
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rota raiz para verificar se o servidor está online
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    message: 'Backend está funcionando!',
    endpoints: {
      login: 'POST /login',
      health: 'GET /health'
    }
  });
});

// Rota de login
app.post('/login', async (req, res) => {
  const { matricula, senha } = req.body;
  
  if (!matricula || !senha) {
    return res.status(400).json({ 
      success: false,
      message: 'Matrícula e senha são obrigatórias' 
    });
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE matricula = ? AND senha = ?',
      [matricula, senha]
    );

    if (rows.length > 0) {
      return res.json({ 
        success: true,
        message: 'Login bem-sucedido' 
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Matrícula ou senha inválidos' 
      });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Erro no servidor',
      error: err.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Rota de saúde do servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
