import { countVotes, type CountResult } from './borda';
import { createBallots, readSpreadsheet, type ColumnMapping, type ImportedSheet } from './parse';

let sheets: ImportedSheet[] = [];
let activeSheet = 0;
let mapping: ColumnMapping | undefined;
const app = document.querySelector<HTMLDivElement>('#app')!;

export function initialiseUi(): void {
  app.innerHTML = `<section class="card upload-card"><h2>1. Choose response spreadsheet</h2><label class="file-drop" for="spreadsheet"><strong>Choose a spreadsheet</strong><span>Accepts Excel, CSV, and OpenDocument files. Files are processed only on this device.</span></label><input id="spreadsheet" type="file" accept=".xlsx,.xls,.csv,.ods" /></section><div id="workspace"></div>`;
  document.querySelector<HTMLInputElement>('#spreadsheet')!.addEventListener('change', loadFile);
}

async function loadFile(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    sheets = readSpreadsheet(await file.arrayBuffer());
    if (!sheets.length) throw new Error('The spreadsheet does not contain a readable worksheet.');
    activeSheet = 0; mapping = structuredClone(sheets[0].mapping); renderWorkspace();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read this spreadsheet.';
    showError(/Encrypted file/.test(message) ? 'This file appears to be an unsupported encrypted or legacy Excel file. In Google Sheets, use File → Download → Microsoft Excel (.xlsx), or download it as CSV, then try again.' : message);
  }
}

function renderWorkspace(): void {
  const sheet = sheets[activeSheet];
  const workspace = document.querySelector<HTMLDivElement>('#workspace')!;
  workspace.innerHTML = `<section class="card"><h2>2. Check imported columns</h2>${sheets.length > 1 ? `<label>Worksheet <select id="sheet-select">${sheets.map((item, index) => `<option value="${index}" ${index === activeSheet ? 'selected' : ''}>${escapeHtml(item.sheetName)}</option>`).join('')}</select></label>` : `<p class="muted">Worksheet: <strong>${escapeHtml(sheet.sheetName)}</strong></p>`}<div id="mapping"></div></section><section class="card"><h2>3. Count settings</h2><div class="settings"><label>Executive password <span class="help">Only a matching key doubles a ballot.</span><div class="password-wrap"><input id="executive-password" type="password" autocomplete="off" /><button id="toggle-password" type="button" class="secondary">Show</button></div></label><label>Number provisionally nominated<input id="nominee-count" type="number" min="1" value="3" /></label></div><button id="count" class="primary" type="button">Calculate ranked result</button></section><div id="result"></div>`;
  document.querySelector<HTMLSelectElement>('#sheet-select')?.addEventListener('change', (event) => { activeSheet = Number((event.target as HTMLSelectElement).value); mapping = structuredClone(sheets[activeSheet].mapping); renderWorkspace(); });
  document.querySelector<HTMLButtonElement>('#toggle-password')!.addEventListener('click', togglePassword);
  document.querySelector<HTMLButtonElement>('#count')!.addEventListener('click', calculate);
  renderMapping();
}

function renderMapping(): void {
  const sheet = sheets[activeSheet]; if (!mapping) return;
  const htmlOptions = (selected?: number, allowBlank = false) => `${allowBlank ? '<option value="">Not present</option>' : ''}${sheet.columnOptions.map((option) => `<option value="${option.index}" ${option.index === selected ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}`;
  document.querySelector<HTMLDivElement>('#mapping')!.innerHTML = `<p class="muted">Candidate columns were detected from question headings. Correct any detection before counting.</p><div class="candidate-map">${mapping.candidates.map((candidate, index) => `<label>Candidate name<input data-candidate-name="${index}" value="${escapeAttribute(candidate.name)}" /></label><label>Ranking column<select data-candidate-column="${index}">${htmlOptions(candidate.index)}</select></label>`).join('')}</div><div class="settings"><label>Email address column<select id="email-column">${htmlOptions(mapping.emailAddressIndex, true)}</select></label><label>No Vote column<select id="no-vote-column">${htmlOptions(mapping.noVoteIndex, true)}</select></label><label>Executive key column<select id="key-column">${htmlOptions(mapping.executiveKeyIndex, true)}</select></label></div>`;
}

function currentMapping(): ColumnMapping {
  if (!mapping) throw new Error('No column mapping is available.');
  const candidates = mapping.candidates.map((_, index) => ({ name: document.querySelector<HTMLInputElement>(`[data-candidate-name="${index}"]`)!.value.trim(), index: Number(document.querySelector<HTMLSelectElement>(`[data-candidate-column="${index}"]`)!.value) }));
  if (candidates.length < 2) throw new Error('At least two candidate ranking columns are required.');
  if (candidates.some((candidate) => !candidate.name)) throw new Error('Every candidate needs a name.');
  if (new Set(candidates.map((candidate) => candidate.index)).size !== candidates.length) throw new Error('Each candidate must use a different ranking column.');
  return { candidates, emailAddressIndex: optionalIndex('#email-column'), noVoteIndex: optionalIndex('#no-vote-column'), executiveKeyIndex: optionalIndex('#key-column') };
}

function optionalIndex(selector: string): number | undefined { const value = document.querySelector<HTMLSelectElement>(selector)!.value; return value === '' ? undefined : Number(value); }
function togglePassword(): void { const input = document.querySelector<HTMLInputElement>('#executive-password')!; input.type = input.type === 'password' ? 'text' : 'password'; document.querySelector<HTMLButtonElement>('#toggle-password')!.textContent = input.type === 'password' ? 'Show' : 'Hide'; }

function calculate(): void {
  try {
    const selectedMapping = currentMapping(); const nominees = Number(document.querySelector<HTMLInputElement>('#nominee-count')!.value);
    const result = countVotes(createBallots(sheets[activeSheet], selectedMapping), { candidateNames: selectedMapping.candidates.map(({ name }) => name), executivePassword: document.querySelector<HTMLInputElement>('#executive-password')!.value, nomineesToSelect: nominees });
    renderResult(result); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  } catch (error) { showError(error instanceof Error ? error.message : 'The count could not be calculated.'); }
}

function renderResult(result: CountResult): void {
  const rankHeaders = result.candidates[0]?.rankCounts.map((_, index) => `<th>Rank ${index + 1}</th>`).join('') ?? '';
  const rows = result.candidates.map((candidate) => `<tr><td><strong>${candidate.rank}${ordinal(candidate.rank)}</strong></td><td>${escapeHtml(candidate.name)}${candidate.nominated ? ' <span class="tag">Nominated</span>' : ''}</td><td>${candidate.total}</td><td>${candidate.regularPoints}</td><td>${candidate.executivePoints}</td>${candidate.rankCounts.map((count) => `<td>${count}</td>`).join('')}</tr>`).join('');
  const issues = result.ballots.filter((ballot) => ballot.status === 'invalid' || ballot.warning).map((ballot) => `<li><strong>Row ${ballot.rowNumber}:</strong> ${escapeHtml(ballot.reason ?? ballot.warning ?? '')}</li>`).join('');
  document.querySelector<HTMLDivElement>('#result')!.innerHTML = `<section class="card results"><div class="result-heading"><div><h2>Ranked result</h2><p class="muted">Lower total scores rank higher. Equal totals share a position.</p></div><button id="export-results" class="secondary" type="button">Download results CSV</button></div><div class="summary"><div><strong>${result.validBallots}</strong><span>valid ballots</span></div><div><strong>${result.executiveBallots}</strong><span>executive ballots doubled</span></div><div><strong>${result.noVoteBallots}</strong><span>No Vote responses</span></div><div><strong>${result.invalidBallots}</strong><span>invalid ballots excluded</span></div></div><div class="table-wrap"><table><thead><tr><th>Position</th><th>Candidate</th><th>Total score</th><th>Regular points</th><th>Executive points</th>${rankHeaders}</tr></thead><tbody>${rows}</tbody></table></div>${issues ? `<div class="notice warning"><strong>Review required</strong><ul>${issues}</ul></div>` : ''}<details><summary>Ballot audit (${result.ballots.length} imported responses)</summary><div class="table-wrap"><table><thead><tr><th>Sheet row</th><th>Email address</th><th>Status</th><th>Weight</th><th>Ranks</th><th>Adjusted ranks</th><th>Note</th></tr></thead><tbody>${result.ballots.map((ballot) => `<tr><td>${ballot.rowNumber}</td><td>${escapeHtml(ballot.emailAddress)}</td><td>${ballot.status}</td><td>${ballot.multiplier}×</td><td>${ballot.ranks.join(', ')}</td><td>${ballot.adjustedRanks.join(', ')}</td><td>${escapeHtml(ballot.reason ?? ballot.warning ?? '')}</td></tr>`).join('')}</tbody></table></div></details><p class="reset-note"><strong>Start a new count:</strong> To reset the sheet, simply reload this page.</p></section>`;
  document.querySelector<HTMLButtonElement>('#export-results')!.addEventListener('click', () => downloadResults(result));
}

function downloadResults(result: CountResult): void {
  const header = ['Position', 'Candidate', 'Total score', 'Regular points', 'Executive points', ...result.candidates[0].rankCounts.map((_, index) => `Rank ${index + 1} votes`)];
  const rows = result.candidates.map((candidate) => [candidate.rank, candidate.name, candidate.total, candidate.regularPoints, candidate.executivePoints, ...candidate.rankCounts]);
  const csv = [header, ...rows].map((line) => line.map(csvCell).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = 'ranked-vote-results.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}
function csvCell(value: string | number): string { return `"${String(value).replaceAll('"', '""')}"`; }
function ordinal(value: number): string { return value % 10 === 1 && value % 100 !== 11 ? 'st' : value % 10 === 2 && value % 100 !== 12 ? 'nd' : value % 10 === 3 && value % 100 !== 13 ? 'rd' : 'th'; }
function showError(message: string): void { const target = document.querySelector<HTMLDivElement>('#result') ?? app; target.innerHTML = `<p class="notice error">${escapeHtml(message)}</p>`; }
function escapeHtml(value: string): string { const element = document.createElement('div'); element.textContent = value; return element.innerHTML; }
function escapeAttribute(value: string): string { return escapeHtml(value).replaceAll('"', '&quot;'); }