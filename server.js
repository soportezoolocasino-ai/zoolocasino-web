const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Crear tabla si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    game_type TEXT NOT NULL,
    data JSONB NOT NULL,
    UNIQUE(date, game_type)
  );
`);

// Obtener resultados
app.get('/api/results/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query('SELECT * FROM results WHERE date = $1', [date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardar resultados
app.post('/api/results', async (req, res) => {
  try {
    const { date, game_type, data } = req.body;
    await pool.query(
      'INSERT INTO results (date, game_type, data) VALUES ($1, $2, $3) ON CONFLICT (date, game_type) DO UPDATE SET data = $3',
      [date, game_type, data]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));