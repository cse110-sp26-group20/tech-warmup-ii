const API_BASE = 'http://localhost:3000/api';

export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    throw err;
  }
}

export async function submitScore(name, score) {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, score }),
    });
    if (!res.ok) throw new Error('Failed to submit score');
    return await res.json();
  } catch (err) {
    console.error('Score submission error:', err);
    throw err;
  }
}
