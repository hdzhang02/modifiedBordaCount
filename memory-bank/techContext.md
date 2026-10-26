# Technical Context

## Stack
- TypeScript
- Vite
- SheetJS `xlsx` for in-browser Excel/CSV/ODS import
- Vitest for unit tests
- `vite-plugin-singlefile` for a standalone offline build

## Commands
- `npm run dev` — local development server
- `npm test` — unit tests
- `npm run build` — create `dist/index.html`

## Environment notes
- Workspace: `c:\Users\zhang13\Repos\modifiedBordaCount`
- Node.js LTS 24.22.1 and npm 11.19.1 were installed with winget.
- The supplied file is named `.xlsx` but has the legacy OLE/`.xls` signature. SheetJS must support both formats.
- SheetJS identifies the supplied OLE file as an incomplete encrypted ECMA-376 container and cannot import it. Excel can open it, but users should re-download through Google Sheets as a genuine `.xlsx` or CSV. The UI reports this recovery path.

## Constraints
- Do not transmit ballot data or the executive password.
- Do not persist the executive password in local storage, URLs, CSV exports, or source configuration.