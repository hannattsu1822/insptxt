const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Nova configuração usando sua URL
const config = {
  uri: process.env.MYSQL_PUBLIC_URL,
  ssl: { rejectUnauthorized: false }
};

// Configuração robusta de CORS
app.use(cors({
  origin: '*', // Troque pelo seu domínio em produção
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rota de login com melhor tratamento de erro
app.post('/login', async (req, res) => {
  console.log('Recebida requisição de login:', req.body);
  
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
    console.log('Conexão com MySQL estabelecida!');

    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE matricula = ? AND senha = ?',
      [matricula, senha]
    );

    if (rows.length > 0) {
      console.log('Login bem-sucedido para matrícula:', matricula);
      return res.json({ 
        success: true,
        message: 'Login bem-sucedido' 
      });
    } else {
      console.log('Credenciais inválidas para matrícula:', matricula);
      return res.status(401).json({ 
        success: false,
        message: 'Matrícula ou senha inválidos' 
      });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
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
  console.log(`🔗 URL do MySQL: ${process.env.MYSQL_PUBLIC_URL}`);
});
