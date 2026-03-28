import { calculateSeriesScore, RaceResult } from '../src/scoring';

describe('calculateSeriesScore', () => {
  const FLEET_SIZE = 10;

  it('should calculate a basic score without throwouts', () => {
    const results: RaceResult[] = [1, 2, 3, 4];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe(10);
  });

  it('should handle DNF penalty as fleetSize + 1', () => {
    const results: RaceResult[] = [1, 'DNF', 3];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe(1 + (FLEET_SIZE + 1) + 3);
  });

  it('should handle DNC penalty as fleetSize + 1', () => {
    const results: RaceResult[] = ['DNC', 2, 3];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe((FLEET_SIZE + 1) + 2 + 3);
  });

  it('should handle DNS penalty as fleetSize + 1', () => {
    const results: RaceResult[] = [1, 2, 'DNS'];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe(1 + 2 + (FLEET_SIZE + 1));
  });

  it('should handle DSQ penalty as fleetSize + 1', () => {
    const results: RaceResult[] = [1, 'DSQ', 3];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe(1 + (FLEET_SIZE + 1) + 3);
  });

  it('should handle OCS penalty as fleetSize + 1', () => {
    const results: RaceResult[] = ['OCS', 2, 3];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe((FLEET_SIZE + 1) + 2 + 3);
  });

  it('should handle RET penalty as fleetSize + 1', () => {
    const results: RaceResult[] = [1, 2, 'RET'];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe(1 + 2 + (FLEET_SIZE + 1));
  });

  it('should apply one throwout correctly', () => {
    const results: RaceResult[] = [1, 5, 2, 10]; // 10 is the worst score
    expect(calculateSeriesScore(results, FLEET_SIZE, 1)).toBe(1 + 2 + 5);
  });

  it('should apply multiple throwouts correctly', () => {
    const results: RaceResult[] = [1, 10, 2, 5, 12]; // 12, 10 are the worst
    expect(calculateSeriesScore(results, FLEET_SIZE, 2)).toBe(1 + 2 + 5);
  });

  it('should apply throwouts with penalties', () => {
    const results: RaceResult[] = [1, 'DNF', 2, 5]; // DNF (11) is the worst, then 5
    expect(calculateSeriesScore(results, FLEET_SIZE, 1)).toBe(1 + 2 + 5);
  });

  it('should handle more throwouts than races', () => {
    const results: RaceResult[] = [1, 2];
    expect(calculateSeriesScore(results, FLEET_SIZE, 3)).toBe(0); // All scores thrown out
  });

  it('should handle zero races', () => {
    const results: RaceResult[] = [];
    expect(calculateSeriesScore(results, FLEET_SIZE, 0)).toBe(0);
  });

  it('should handle all races as throwouts', () => {
    const results: RaceResult[] = [10, 20, 30];
    expect(calculateSeriesScore(results, FLEET_SIZE, 3)).toBe(0);
  });

  it('should correctly sort and throw out from mixed results', () => {
    const results: RaceResult[] = ['DNS', 1, 5, 'DNF', 2]; // Penalties become 11, 11
    // Sorted: 1, 2, 5, 11(DNF), 11(DNS)
    // With 1 throwout: 1, 2, 5, 11(DNF)
    expect(calculateSeriesScore(results, FLEET_SIZE, 1)).toBe(1 + 2 + 5 + 11);
    // With 2 throwouts: 1, 2, 5
    expect(calculateSeriesScore(results, FLEET_SIZE, 2)).toBe(1 + 2 + 5);
  });
});
