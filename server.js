const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Banco de dados
const db = new sqlite3.Database('./vendas.db');

// Criação da tabela
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      quantidade INTEGER,
      valor REAL,
      data TEXT
    )
  `);
});

// Rotas
app.get('/vendas', (req, res) => {
  const { usuario } = req.query;
  const query = usuario && usuario !== 'todos' 
    ? `SELECT * FROM vendas WHERE usuario = ?`
    : `SELECT * FROM vendas`;

  db.all(query, usuario && usuario !== 'todos' ? [usuario] : [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.post('/vendas', (req, res) => {
  const { usuario, quantidade, valor, data } = req.body;

  db.run(
    `INSERT INTO vendas (usuario, quantidade, valor, data) VALUES (?, ?, ?, ?)`,
    [usuario, quantidade, valor, data],
    function(err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/vendas', (req, res) => {
  db.run(`DELETE FROM vendas`, [], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
