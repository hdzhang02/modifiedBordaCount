# System Patterns

## Layers
- `src/borda.ts`: deterministic, pure TypeScript domain logic. It validates and classifies ballots, adjusts executive ranks, calculates totals, ranks candidates, and produces audit output.
- `src/parse.ts`: spreadsheet parsing and header-based column detection. It contains no score calculations.
- `src/ui.ts`: browser event handling, settings, rendering, and CSV downloads.
- `src/main.ts`: application bootstrap and CSS import.

## Ballot classification order
1. If the configured No Vote column has a non-empty value, classify as `no-vote`; do not inspect ranks.
2. Otherwise validate that each candidate has an integer rank and that ranks are exactly the unique set `1..candidateCount`.
3. A valid ballot gets multiplier 2 only if a non-empty configured password exactly matches its trimmed key; otherwise multiplier 1. A supplied but non-matching key is a warning.

## Ranking pattern
Candidates are sorted ascending by total. Equal totals receive the same displayed rank, with later ranks skipped (competition ranking: `1, 1, 3`). The nominated state is based on score groups, so a tied group crossing the configured nomination boundary is included and labelled accordingly.

## Import pattern
Candidate names are captured from headers matching `ranking for <candidate>` (case-insensitive). No Vote and executive key columns are similarly detected from their headers. The parsed response table ends at the last detected input column, ignoring manual helper columns on the right.

Email Address is auto-detected as a separate optional mapping. It is propagated to the local ballot audit only; it has no role in validation or scoring and is not included in the downloadable results CSV.