import * as XLSX from "xlsx";
import { Transaction } from "@/types/models";

export type ImportedTransaction = Omit<
  Transaction,
  "id" | "account_id" | "created_at"
>;

const RESTBETRAG_MARKER = "restbetrag";

function cellText(raw: unknown): string {
  return raw === null || raw === undefined ? "" : String(raw).trim();
}

function parseGermanDate(raw: unknown): Date | null {
  if (raw instanceof Date) {
    return raw;
  }

  if (typeof raw === "string") {
    const match = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
    if (!match) {
      return null;
    }
    const day = Number(match[1]);
    const month = Number(match[2]);
    let year = Number(match[3]);
    if (year < 100) {
      year += 2000;
    }
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof raw === "number") {
    // Excel serial date (days since 1899-12-30).
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + raw);
    return epoch;
  }

  return null;
}

function toAmount(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const normalized = raw.trim().replace(/\./g, "").replace(",", ".");
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

// Each month sheet lays out two side-by-side tables sharing the header row
// "Datum | Betrag | Beschreibung | Grund": the leftmost is income, any
// further one found on the same row is treated as an expense table.
function parseSheetRows(rows: unknown[][]): ImportedTransaction[] {
  const header = rows[0] ?? [];
  const tableStarts: number[] = [];

  header.forEach((cell, index) => {
    if (cellText(cell).toLowerCase() === "datum") {
      tableStarts.push(index);
    }
  });

  const transactions: ImportedTransaction[] = [];

  tableStarts.forEach((startIndex, tableIndex) => {
    const isIncomeTable = tableIndex === 0;

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] ?? [];
      const dateCell = row[startIndex];
      const amountCell = row[startIndex + 1];
      const descriptionCell = row[startIndex + 2];
      const categoryCell = row[startIndex + 3];

      if (!cellText(dateCell)) {
        continue;
      }

      const category = cellText(categoryCell);
      const description = cellText(descriptionCell);
      if (
        category.toLowerCase() === RESTBETRAG_MARKER ||
        description.toLowerCase() === RESTBETRAG_MARKER
      ) {
        continue;
      }

      const date = parseGermanDate(dateCell);
      const amount = toAmount(amountCell);
      if (!date || amount === null) {
        continue;
      }

      transactions.push({
        target_account_id: null,
        amount: isIncomeTable ? Math.abs(amount) : -Math.abs(amount),
        transaction_type: isIncomeTable ? "INCOMING" : "OUTGOING",
        category: category || null,
        institution: description || null,
        occurred_at: date.toISOString(),
      });
    }
  });

  return transactions;
}

export interface ParsedWorkbook {
  checking: ImportedTransaction[];
  savings: ImportedTransaction[];
}

function byDateAscending(a: ImportedTransaction, b: ImportedTransaction) {
  return a.occurred_at < b.occurred_at ? -1 : 1;
}

// A sheet named "Sparkonto" (savings account) is kept separate from the
// monthly checking-account sheets so each can be imported into the matching
// account instead of being merged into one.
export function parseWorkbookTransactions(buffer: ArrayBuffer): ParsedWorkbook {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  const checking: ImportedTransaction[] = [];
  const savings: ImportedTransaction[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: null,
    });
    const target = sheetName.trim().toLowerCase() === "sparkonto"
      ? savings
      : checking;
    target.push(...parseSheetRows(rows));
  }

  checking.sort(byDateAscending);
  savings.sort(byDateAscending);
  return { checking, savings };
}
