const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do MySQL usando sua URL do Railway
const config = {
  uri: process.env.MYSQL_PUBLIC_URL || 'mysql://root:iQtgahZpQNuxJfCcCmCLcQMxfiLzyyfI@nozomi.proxy.rlwy.net:39585/railway',
  ssl: { rejectUnauthorized: false }
};

// Configuração de CORS para desenvolvimento/produção
app.use(cors({
  origin: ['https://insptxt-production.up.railway.app', 'http://localhost'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Rota de login - Versão simplificada e segura
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
      return res.json({ 
        success: true,
        message: '✅ Login bem-sucedido!' 
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: '❌ Matrícula ou senha incorretos' 
      });
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({ 
      success: false,
      message: '🔥 Erro interno no servidor' 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
