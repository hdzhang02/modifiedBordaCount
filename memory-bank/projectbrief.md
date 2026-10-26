# Project Brief

## Goal
Provide an offline, cross-platform browser application that calculates the AUSCO Presidency ranked-vote count from a Google Forms / Google Sheets spreadsheet download.

## Authoritative voting requirements
- Every ordinary ballot ranks every nominee exactly once from `1` (highest preference) through the number of nominees (lowest preference).
- A ballot marked **No Vote** is not counted, even if ranking cells contain values.
- Each candidate's score is the sum of their ranks; lower scores rank higher.
- An outgoing Executive member's numerical ranks count twice when their confidential key matches the configured executive password.
- The three lowest-scoring candidates are provisionally nominated by default; this count must be configurable.
- Ties must be reported and not silently broken.
- Invalid ballots are excluded and reported with their reasons.

## Scope
- Import `.xlsx`, legacy `.xls`, `.csv`, and `.ods` files locally.
- Auto-detect Google Forms response columns, while allowing the operator to correct mappings.
- Display results, ballot validation/audit information, and export CSV files.
- Build to a single offline HTML file.

## Out of scope
- Authentication, vote collection, cloud storage, or transmission of ballot data.
- Automatic tie-breaking.