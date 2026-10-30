import type {CellValue, Workbook, WorkbookSheet} from '../types/workbook'

const normalize = (v: unknown): CellValue => v === undefined || v === '' ? null : typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string' ? v : String(v)

export async function parseExcelFile(file: File): Promise<Workbook> {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer();
    const book = XLSX.read(buffer, {type: 'array', cellDates: true})
    const sheets: WorkbookSheet[] = book.SheetNames.map((name) => {
        const ws = book.Sheets[name];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {header: 1, defval: null, raw: true}) as unknown[][];
        const nonEmpty = rows.filter((r) => r.some((v) => v !== null && v !== ''));
        const headers = (nonEmpty[0] ?? []).map((v, i) => String(v ?? `列 ${i + 1}`));
        const data = nonEmpty.slice(1).map((r) => headers.map((_, i) => normalize(r[i] ?? null)));
        return {name, rows: data.length, columns: headers.length, headers, data, dataRange: ws['!ref'] ?? '空工作表'}
    })
    return {workbookId: '', fileName: file.name, fileSize: file.size, sheets}
}
