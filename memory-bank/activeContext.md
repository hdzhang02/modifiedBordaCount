# Active Context

## Current focus
Initial implementation is complete and validated.

## Confirmed decisions
- Lower rank sums are better.
- No Vote overrides otherwise completed ranks.
- Invalid ballots are excluded with warnings.
- A wrong, non-empty executive key remains a normal vote and is warned about.
- Ties are displayed, not resolved.
- The executive password is configurable at count time.

## Example spreadsheet discovery
`EXAMPLE AUSCO Presidential Ranked Vote (Responses).xlsx` contains a Google Forms table in `A:G`: timestamp, redacted email, three candidate ranks, No Vote, and executive key. Columns `I:K` are manual helper calculations and must be ignored. The only No Vote response is row 24 and includes ranks, confirming precedence of No Vote.

## Open decisions
None required for the first implementation.

## Implementation notes
- `dist/index.html` is the self-contained distributable application.
- The supplied legacy-format example cannot be parsed by SheetJS despite its `.xlsx` extension; its rows are retained as a domain regression fixture after being inspected in Excel.
- `README.md` is written for non-technical election officers and documents downloading Google Sheets responses, using `dist/index.html`, reviewing warnings, and exporting results.
- Header branding now names the Auckland University Student Chamber Orchestra Incorporated Presidential Voting Tool in blue. Results include a reload instruction for starting a new count.
- The offline header embeds `src/AUSCO_horizontal_logo.png`, displayed beside the title on wider screens and above it on narrow screens. Email Address is now auto-detected and shown in the local ballot audit for sheet cross-checking.