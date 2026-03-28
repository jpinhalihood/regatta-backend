
import express from 'express';
import cors from 'cors';
import { calculateSeriesScore, RaceResult } from './scoring';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/score', (req, res) => {
  try {
    const { results, fleetSize, numThrowouts } = req.body;

    // Validate input
    const validPenalties = ['DNF', 'DNC', 'DNS', 'DSQ', 'OCS', 'RET'];
    if (!Array.isArray(results) || results.some(r => typeof r !== 'number' && (typeof r !== 'string' || !validPenalties.includes(r)))) {
      return res.status(400).json({ error: 'Invalid results array' });
    }
    if (typeof fleetSize !== 'number' || fleetSize <= 0) {
      return res.status(400).json({ error: 'Invalid fleetSize' });
    }
    // numThrowouts is optional, default to 0 if not provided or invalid
    const actualNumThrowouts = typeof numThrowouts === 'number' && numThrowouts >= 0 ? numThrowouts : 0;

    const totalScore = calculateSeriesScore(results as RaceResult[], fleetSize, actualNumThrowouts);
    res.json({ totalScore });
  } catch (error) {
    console.error('Error calculating score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default server; // Export the server instance for testing
