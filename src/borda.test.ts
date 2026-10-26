import { describe, expect, it } from 'vitest';
import { countVotes, type RawBallot } from './borda';

const candidates = ['Adi', 'Justin', 'Wei Train'];
const options = { candidateNames: candidates, executivePassword: 'D7BA8C08', nomineesToSelect: 3 };

describe('countVotes', () => {
  it('excludes a No Vote ballot even when it contains rankings', () => {
    const result = countVotes([
      { rowNumber: 2, ranks: [1, 3, 2] },
      { rowNumber: 3, ranks: [1, 3, 2], noVoteValue: 'No Vote' },
    ], options);
    expect(result.candidates.map(({ name, total }) => [name, total])).toEqual([
      ['Adi', 1], ['Wei Train', 2], ['Justin', 3],
    ]);
    expect(result.noVoteBallots).toBe(1);
  });

  it('doubles every rank on a matching executive ballot', () => {
    const result = countVotes([{ rowNumber: 2, ranks: [1, 3, 2], executiveKey: ' D7BA8C08 ' }], options);
    expect(result.candidates.map(({ name, total }) => [name, total])).toEqual([
      ['Adi', 2], ['Wei Train', 4], ['Justin', 6],
    ]);
    expect(result.executiveBallots).toBe(1);
  });

  it('counts a ballot with a wrong supplied key normally and warns', () => {
    const result = countVotes([{ rowNumber: 2, ranks: [1, 3, 2], executiveKey: 'wrong' }], options);
    expect(result.candidates[0].total).toBe(1);
    expect(result.warningBallots).toBe(1);
    expect(result.ballots[0].warning).toContain('non-matching');
  });

  it('keeps the email address in the ballot audit without using it to score the vote', () => {
    const result = countVotes([{ rowNumber: 2, emailAddress: 'voter@example.org', ranks: [1, 3, 2] }], options);
    expect(result.ballots[0].emailAddress).toBe('voter@example.org');
    expect(result.candidates[0].total).toBe(1);
  });

  it('excludes repeated, missing and out-of-range ranks', () => {
    const result = countVotes([
      { rowNumber: 2, ranks: [1, 1, 3] },
      { rowNumber: 3, ranks: [1, '', 3] },
      { rowNumber: 4, ranks: [1, 2, 4] },
    ], options);
    expect(result.invalidBallots).toBe(3);
    expect(result.candidates.every((candidate) => candidate.total === 0)).toBe(true);
  });

  it('matches the verified example result after excluding its No Vote response', () => {
    const executive = 'D7BA8C08';
    const ballots: RawBallot[] = [
      { rowNumber: 2, ranks: [1, 3, 2], executiveKey: executive }, { rowNumber: 3, ranks: [3, 2, 1] },
      { rowNumber: 4, ranks: [3, 2, 1] }, { rowNumber: 5, ranks: [3, 2, 1] }, { rowNumber: 6, ranks: [3, 1, 2] },
      { rowNumber: 7, ranks: [2, 3, 1], executiveKey: executive }, { rowNumber: 8, ranks: [1, 2, 3], executiveKey: executive },
      { rowNumber: 9, ranks: [1, 3, 2] }, { rowNumber: 10, ranks: [2, 3, 1], executiveKey: executive },
      { rowNumber: 11, ranks: [1, 2, 3], executiveKey: executive }, { rowNumber: 12, ranks: [1, 3, 2], executiveKey: executive },
      { rowNumber: 13, ranks: [2, 1, 3] }, { rowNumber: 14, ranks: [1, 2, 3] }, { rowNumber: 15, ranks: [3, 2, 1], executiveKey: executive },
      { rowNumber: 16, ranks: [3, 2, 1] }, { rowNumber: 17, ranks: [3, 1, 2], executiveKey: executive }, { rowNumber: 18, ranks: [3, 1, 2] },
      { rowNumber: 19, ranks: [2, 3, 1], executiveKey: executive }, { rowNumber: 20, ranks: [3, 2, 1] },
      { rowNumber: 21, ranks: [1, 3, 2], executiveKey: executive }, { rowNumber: 22, ranks: [3, 1, 2] },
      { rowNumber: 23, ranks: [3, 2, 1], executiveKey: executive }, { rowNumber: 24, ranks: [1, 3, 2], noVoteValue: 'No Vote' },
      { rowNumber: 25, ranks: [2, 3, 1], executiveKey: executive }, { rowNumber: 26, ranks: [1, 3, 2], executiveKey: executive },
      { rowNumber: 27, ranks: [1, 3, 2], executiveKey: executive },
    ];
    const result = countVotes(ballots, options);
    expect(result.candidates.map(({ name, total }) => [name, total])).toEqual([
      ['Wei Train', 67], ['Adi', 76], ['Justin', 91],
    ]);
    expect(result).toMatchObject({ validBallots: 25, executiveBallots: 14, noVoteBallots: 1 });
  });

  it('reports tied candidates at the same rank', () => {
    const result = countVotes([{ rowNumber: 2, ranks: [1, 2] }, { rowNumber: 3, ranks: [2, 1] }], {
      candidateNames: ['A', 'B'], executivePassword: '', nomineesToSelect: 1,
    });
    expect(result.candidates.map(({ rank, nominated }) => [rank, nominated])).toEqual([[1, true], [1, true]]);
  });
});