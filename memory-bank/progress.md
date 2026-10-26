# Progress

## Complete
- Requirements and spreadsheet layout inspected in read-only mode.
- Expected example result independently derived.
- Memory Bank initialised.
- TypeScript/Vite/SheetJS/Vitest application implemented.
- Scoring engine, spreadsheet column detection, browser UI, audit table and CSV export implemented.
- Unit tests cover No Vote precedence, executive doubling, wrong keys, invalid ranks, ties, and the complete example response data.
- Production build creates a single `dist/index.html` file.
- Plain-English operator instructions are available in the root `README.md`.
- Branding and usability updates: AU Student Chamber Orchestra presidential-tool heading and a post-result reload/reset note.
- Added responsive AUSCO horizontal logo branding and Email Address visibility in the local ballot audit.

## In progress
None.

## Remaining
- Optional future work: test with a freshly downloaded Google Sheets `.xlsx` or CSV file in the browser.

## Known example issues
- Spreadsheet header says `Wei Train`, while its manual helper column says `Wei Tian`; imported results deliberately use the response header verbatim.
- Manual totals include the No Vote row. Correct totals exclude it.
- Blank helper rows contain erroneous `/2` formulas but are irrelevant and ignored.
- The given file cannot be imported by SheetJS because its extension does not match its unsupported OLE/encrypted-container content. Re-download it from Google Sheets in `.xlsx` or CSV format for use in the app.