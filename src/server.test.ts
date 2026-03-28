
import request from 'supertest';
import server from './server'; // Import the server instance

describe('POST /api/score', () => {
  it('should calculate the series score correctly with throwouts', async () => {
    const payload = {
      results: [1, 2, 3, 10, 'DNF', 4],
      fleetSize: 10,
      numThrowouts: 2,
    };

    const res = await request(server)
      .post('/api/score')
      .send(payload)
      .expect(200);

    // Expected score: [1, 2, 3, 4, 10, 11] -> throw out 10, 11 -> 1+2+3+4 = 10
    expect(res.body.totalScore).toBe(10);
  });

  it('should calculate the series score correctly without throwouts', async () => {
    const payload = {
      results: [1, 2, 3, 4],
      fleetSize: 5,
      numThrowouts: 0,
    };

    const res = await request(server)
      .post('/api/score')
      .send(payload)
      .expect(200);

    expect(res.body.totalScore).toBe(10);
  });

  it('should handle string penalties correctly', async () => {
    const payload = {
      results: [1, 'DNF', 2, 'DSQ', 'DNC', 'DNS', 'OCS', 'RET', 3],
      fleetSize: 10,
      numThrowouts: 0,
    };

    const res = await request(server)
      .post('/api/score')
      .send(payload)
      .expect(200);

    // Expected: [1, 2, 3, 11, 11, 11, 11, 11] = 71
    expect(res.body.totalScore).toBe(72);
  });


  it('should return 500 if calculateSeriesScore throws an error', async () => {
    // Mock the scoring module to throw an error
    const scoring = require('./scoring');
    const originalCalculateSeriesScore = scoring.calculateSeriesScore;
    scoring.calculateSeriesScore = jest.fn(() => {
      throw new Error('Test error');
    });

    const payload = {
      results: [1, 2, 3],
      fleetSize: 10,
      numThrowouts: 0,
    };

    await request(server)
      .post('/api/score')
      .send(payload)
      .expect(500)
      .expect({ error: 'Internal server error' });

    // Restore the original implementation
    scoring.calculateSeriesScore = originalCalculateSeriesScore;
  });

  it('should return 400 for invalid results array containing an unknown penalty string', async () => {
    const payload = {
      results: [1, 'INVALID_PENALTY', 2],
      fleetSize: 10,
      numThrowouts: 0,
    };

    await request(server)
      .post('/api/score')
      .send(payload)
      .expect(400)
      .expect({ error: 'Invalid results array' });
  });

  afterAll((done) => {
    // Close the server after all tests are done
    server.close(() => {
      done();
    });
  });

  it('should return 400 for invalid fleetSize', async () => {
    const payload = {
      results: [1, 2, 3],
      fleetSize: 0,
      numThrowouts: 0,
    };

    await request(server)
      .post('/api/score')
      .send(payload)
      .expect(400)
      .expect({ error: 'Invalid fleetSize' });
  });

  it('should default numThrowouts to 0 if not provided', async () => {
    const payload = {
      results: [1, 2, 3, 10],
      fleetSize: 10,
    };

    const res = await request(server)
      .post('/api/score')
      .send(payload)
      .expect(200);

    // Expected score: [1, 2, 3, 10] = 16
    expect(res.body.totalScore).toBe(16);
  });
});
