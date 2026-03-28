
export type RaceResult = number | 'DNF' | 'DNC' | 'DNS' | 'DSQ' | 'OCS' | 'RET';

/**
 * Calculates the ISAF Low Point score for a series of races.
 *
 * @param results An array of race finishes, where numbers are points and strings are penalties.
 * @param fleetSize The number of boats in the largest fleet for calculating penalties.
 * @param numThrowouts The number of worst scores to discard.
 * @returns The total series score.
 */
export function calculateSeriesScore(
  results: RaceResult[],
  fleetSize: number,
  numThrowouts: number = 0
): number {
  const penaltyPoints: Record<RaceResult, number> = {
    'DNF': fleetSize + 1,
    'DNC': fleetSize + 1,
    'DNS': fleetSize + 1,
    'DSQ': fleetSize + 1, // Disqualification
    'OCS': fleetSize + 1, // On Course Side (premature start)
    'RET': fleetSize + 1, // Retired
  };

  const scoredResults = results.map(result => {
    if (typeof result === 'number') {
      return result;
    } else {
      return penaltyPoints[result];
    }
  }).sort((a, b) => a - b); // Sort to easily identify worst scores

  // Apply throwouts
  const numScoresToKeep = Math.max(0, scoredResults.length - numThrowouts);
  const scoresToCount = scoredResults.slice(0, numScoresToKeep);

  const totalScore = scoresToCount.reduce((sum, score) => sum + score, 0);

  return totalScore;
}
