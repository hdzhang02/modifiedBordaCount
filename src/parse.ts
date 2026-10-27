import * as XLSX from 'xlsx';
import type { RawBallot } from './borda';

export interface ColumnOption { index: number; label: string; }
export interface CandidateColumn { name: string; index: number; }
export interface ColumnMapping { candidates: CandidateColumn[]; emailAddressIndex?: number; noVoteIndex?: number; executiveKeyIndex?: number; }
export interface ImportedSheet { sheetName: string; headers: string[]; rows: unknown[][]; columnOptions: ColumnOption[]; mapping: ColumnMapping; }

const text = (value: unknown): string => String(value ?? '').trim();

export function readSpreadsheet(data: ArrayBuffer): ImportedSheet[] {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  return workbook.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: '', raw: false });
    const headers = (rows[0] ?? []).map(text);
    const columnOptions = headers.map((header, index) => ({ index, label: `${excelColumn(index)} — ${header || '(blank header)'}` }));
    return { sheetName: sheetName.trim(), headers, rows: rows.slice(1), columnOptions, mapping: detectMapping(headers) };
  });
}

export function detectMapping(headers: string[]): ColumnMapping {
  const candidates: CandidateColumn[] = [];
  let noVoteIndex: number | undefined;
  let executiveKeyIndex: number | undefined;
  let emailAddressIndex: number | undefined;
  headers.forEach((header, index) => {
    const candidate = header.match(/(?:rank(?:ing)?\s+(?:for|of)|ranking\s*[-:]?)\s*(.+)$/i);
    if (candidate?.[1] && !/no vote/i.test(header)) candidates.push({ name: candidate[1].trim(), index });
    if (/no vote/i.test(header)) noVoteIndex = index;
    if (/(?:confidential\s+)?(?:key|password)|executive officer/i.test(header)) executiveKeyIndex = index;
    if (/e-?mail(?:\s+address)?|username/i.test(header)) emailAddressIndex = index;
  });
  return { candidates, emailAddressIndex, noVoteIndex, executiveKeyIndex };
}

export function createBallots(sheet: ImportedSheet, mapping: ColumnMapping): RawBallot[] {
  return sheet.rows
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter(({ row }) => mapping.candidates.some(({ index }) => text(row[index]) !== '') || (mapping.noVoteIndex !== undefined && text(row[mapping.noVoteIndex]) !== ''))
    .map(({ row, rowNumber }) => ({
      rowNumber,
      emailAddress: mapping.emailAddressIndex === undefined ? '' : text(row[mapping.emailAddressIndex]),
      ranks: mapping.candidates.map(({ index }) => text(row[index])),
      noVoteValue: mapping.noVoteIndex === undefined ? '' : text(row[mapping.noVoteIndex]),
      executiveKey: mapping.executiveKeyIndex === undefined ? '' : text(row[mapping.executiveKeyIndex]),
    }));
}

function excelColumn(index: number): string {
  let number = index + 1;
  let result = '';
  while (number > 0) { const remainder = (number - 1) % 26; result = String.fromCharCode(65 + remainder) + result; number = Math.floor((number - 1) / 26); }
  return result;
}