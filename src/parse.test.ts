import { describe, expect, it } from 'vitest';
import { detectMapping, readSpreadsheet } from './parse';
import * as XLSX from 'xlsx';

describe('spreadsheet parsing', () => {
  it('uses the workbook worksheet name exactly, after surrounding whitespace is removed', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Username'], ['voter@example.org']]), ' Form Responses 1 ');
    const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    expect(readSpreadsheet(bytes)[0].sheetName).toBe('Form Responses 1');
  });

  it('recognises Username as the email-address column', () => {
    const mapping = detectMapping(['Timestamp', 'Username', 'Please indicate your ranking for Ada']);
    expect(mapping.emailAddressIndex).toBe(1);
  });
});