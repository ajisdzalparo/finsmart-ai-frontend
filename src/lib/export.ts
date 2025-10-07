import { type Report } from '@/api/reports';

function escapeHtml(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTitle(text: string): string {
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toExpenseByCategoryRows(
  summary: unknown,
): Array<{ Kategori: string; Jumlah: number }> | null {
  if (
    typeof summary !== 'object' ||
    summary === null ||
    !('expenseByCategory' in summary)
  )
    return null;
  const rows = (
    summary as {
      expenseByCategory: Array<{ categoryName: string; amount: number }>;
    }
  ).expenseByCategory;
  return rows.map((r) => ({ Kategori: r.categoryName, Jumlah: r.amount }));
}

function toIncomeVsExpenseRows(
  summary: unknown,
): Array<{ Income: number; Expense: number; Balance: number }> | null {
  if (typeof summary !== 'object' || summary === null || !('totals' in summary))
    return null;
  const t = (
    summary as { totals: { income: number; expense: number; balance: number } }
  ).totals;
  return [{ Income: t.income, Expense: t.expense, Balance: t.balance }];
}

function toCashflowMonthlyRows(summary: unknown): Array<{
  Bulan: string;
  Income: number;
  Expense: number;
  Balance: number;
}> | null {
  if (
    typeof summary !== 'object' ||
    summary === null ||
    !('cashflowMonthly' in summary)
  )
    return null;
  const rows = (
    summary as {
      cashflowMonthly: Array<{
        month: string;
        income: number;
        expense: number;
        balance: number;
      }>;
    }
  ).cashflowMonthly;
  return rows.map((r) => ({
    Bulan: r.month,
    Income: r.income,
    Expense: r.expense,
    Balance: r.balance,
  }));
}

function buildHtmlTable<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows || rows.length === 0)
    return '<table class="fs-table"><thead><tr><th>Tidak ada data</th></tr></thead><tbody></tbody></table>';
  const headers = Object.keys(rows[0]);
  const thead = `<thead><tr>${headers
    .map((h) => `<th class="fs-th">${escapeHtml(h)}</th>`)
    .join('')}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => `<td class="fs-td">${escapeHtml(row[h])}</td>`)
          .join('')}</tr>`,
    )
    .join('')}</tbody>`;
  return `<table class="fs-table" border="1">${thead}${tbody}</table>`;
}

export function exportReportToExcel(report: Report) {
  const fileBase = `${report.reportType}-${new Date(
    report.generatedAt,
  ).toISOString()}`;
  let rows: Array<Record<string, unknown>> | null = null;

  if (report.reportType === 'expense_by_category') {
    rows = toExpenseByCategoryRows(report.summary as unknown);
  } else if (report.reportType === 'income_vs_expense') {
    rows = toIncomeVsExpenseRows(report.summary as unknown);
  } else if (report.reportType === 'cashflow_monthly') {
    rows = toCashflowMonthlyRows(report.summary as unknown);
  }

  // Fallback: flatten summary JSON to rows of key-value
  if (!rows) {
    const jsonStr = JSON.stringify(report.summary ?? {}, null, 2);
    rows = jsonStr.split('\n').map((line) => ({ Baris: line }));
  }

  const table = buildHtmlTable(rows);
  const title = toTitle(report.reportType);
  const generatedAt = new Date(report.generatedAt).toLocaleString('id-ID');
  const styles = `
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
      .fs-header { text-align: center; margin-bottom: 16px; }
      .fs-brand { font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
      .fs-subtitle { font-size: 14px; color: #475569; margin-top: 2px; }
      .fs-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
      .fs-table { border-collapse: collapse; width: 100%; }
      .fs-th { background: #eef2ff; color: #1e293b; text-align: left; padding: 8px; }
      .fs-td { padding: 8px; }
      .fs-table tr:nth-child(even) td { background: #f8fafc; }
      .fs-table tr:nth-child(odd) td { background: #ffffff; }
    </style>
  `;
  const header = `
    <div class="fs-header">
      <div class="fs-brand">FINSMART</div>
      <div class="fs-subtitle">${escapeHtml(title)}</div>
      <div class="fs-meta">Dibuat: ${escapeHtml(generatedAt)}</div>
    </div>
  `;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />${styles}</head><body>${header}${table}</body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileBase}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
