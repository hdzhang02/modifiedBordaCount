export type BallotStatus = 'valid' | 'no-vote' | 'invalid';

export interface RawBallot {
  rowNumber: number;
  ranks: Array<string | number | null | undefined>;
  noVoteValue?: string | number | null;
  executiveKey?: string | number | null;
}

export interface CountOptions {
  candidateNames: string[];
  executivePassword: string;
  nomineesToSelect: number;
}

export interface BallotAudit {
  rowNumber: number;
  status: BallotStatus;
  multiplier: 1 | 2;
  ranks: Array<number | null>;
  adjustedRanks: Array<number | null>;
  reason?: string;
  warning?: string;
}

export interface CandidateResult {
  name: string;
  total: number;
  rank: number;
  nominated: boolean;
  rankCounts: number[];
  regularPoints: number;
  executivePoints: number;
}

export interface CountResult {
  candidates: CandidateResult[];
  ballots: BallotAudit[];
  validBallots: number;
  executiveBallots: number;
  noVoteBallots: number;
  invalidBallots: number;
  warningBallots: number;
}

const cellText = (value: string | number | null | undefined): string => String(value ?? '').trim();

function parseRank(value: string | number | null | undefined): number | null {
  const text = cellText(value);
  if (!/^\d+$/.test(text)) return null;
  const rank = Number(text);
  return Number.isSafeInteger(rank) ? rank : null;
}

export function countVotes(ballots: RawBallot[], options: CountOptions): CountResult {
  const { candidateNames, executivePassword } = options;
  if (candidateNames.length < 1) throw new Error('At least one candidate is required.');
  if (new Set(candidateNames).size !== candidateNames.length) throw new Error('Candidate names must be unique.');
  if (!Number.isInteger(options.nomineesToSelect) || options.nomineesToSelect < 1) {
    throw new Error('The number of nominees to select must be at least 1.');
  }

  const totals = candidateNames.map(() => 0);
  const regularPoints = candidateNames.map(() => 0);
  const executivePoints = candidateNames.map(() => 0);
  const rankCounts = candidateNames.map(() => Array<number>(candidateNames.length).fill(0));
  const audits: BallotAudit[] = [];
  let validBallots = 0;
  let executiveBallots = 0;
  let noVoteBallots = 0;
  let invalidBallots = 0;
  let warningBallots = 0;

  for (const ballot of ballots) {
    if (cellText(ballot.noVoteValue) !== '') {
      noVoteBallots += 1;
      audits.push({ rowNumber: ballot.rowNumber, status: 'no-vote', multiplier: 1, ranks: [], adjustedRanks: [] });
      continue;
    }

    const ranks = ballot.ranks.map(parseRank);
    const invalidReason = validateRanks(ranks, candidateNames.length);
    if (invalidReason) {
      invalidBallots += 1;
      audits.push({ rowNumber: ballot.rowNumber, status: 'invalid', multiplier: 1, ranks, adjustedRanks: [], reason: invalidReason });
      continue;
    }

    const suppliedKey = cellText(ballot.executiveKey);
    const isExecutive = executivePassword !== '' && suppliedKey === executivePassword.trim();
    const warning = suppliedKey !== '' && !isExecutive
      ? 'A non-matching executive key was supplied; this ballot counted as a regular vote.'
      : undefined;
    const multiplier: 1 | 2 = isExecutive ? 2 : 1;
    const adjustedRanks = ranks.map((rank) => rank! * multiplier);

    validBallots += 1;
    if (isExecutive) executiveBallots += 1;
    if (warning) warningBallots += 1;
    ranks.forEach((rank, index) => {
      const value = rank!;
      totals[index] += value * multiplier;
      rankCounts[index][value - 1] += 1;
      if (isExecutive) executivePoints[index] += value * multiplier;
      else regularPoints[index] += value;
    });
    audits.push({ rowNumber: ballot.rowNumber, status: 'valid', multiplier, ranks, adjustedRanks, warning });
  }

  const sorted = candidateNames.map((name, index) => ({ name, index, total: totals[index] })).sort((a, b) => a.total - b.total || a.name.localeCompare(b.name));
  let previousTotal: number | undefined;
  let displayedRank = 0;
  const resultByIndex = new Map<number, CandidateResult>();
  sorted.forEach((candidate, position) => {
    if (candidate.total !== previousTotal) displayedRank = position + 1;
    previousTotal = candidate.total;
    resultByIndex.set(candidate.index, {
      name: candidate.name,
      total: candidate.total,
      rank: displayedRank,
      nominated: displayedRank <= options.nomineesToSelect,
      rankCounts: rankCounts[candidate.index],
      regularPoints: regularPoints[candidate.index],
      executivePoints: executivePoints[candidate.index],
    });
  });

  return {
    candidates: sorted.map((candidate) => resultByIndex.get(candidate.index)!),
    ballots: audits,
    validBallots,
    executiveBallots,
    noVoteBallots,
    invalidBallots,
    warningBallots,
  };
}

function validateRanks(ranks: Array<number | null>, candidateCount: number): string | undefined {
  if (ranks.length !== candidateCount) return 'The ballot does not include a rank for every candidate.';
  if (ranks.some((rank) => rank === null)) return `Every candidate must have a whole-number rank from 1 to ${candidateCount}.`;
  const numericRanks = ranks as number[];
  if (numericRanks.some((rank) => rank < 1 || rank > candidateCount)) return `Ranks must be between 1 and ${candidateCount}.`;
  if (new Set(numericRanks).size !== candidateCount) return 'Each rank must be used by exactly one candidate.';
  return undefined;
}