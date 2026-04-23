const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let leaderboard = [];

app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboard.slice(0, 10));
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  leaderboard.push({
    name: name.substring(0, 3).toUpperCase(),
    score,
    date: new Date().toISOString(),
  });

  leaderboard.sort((a, b) => b.score - a.score);

  if (leaderboard.length > 100) {
    leaderboard = leaderboard.slice(0, 100);
  }

  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
