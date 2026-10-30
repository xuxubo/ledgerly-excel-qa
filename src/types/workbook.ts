export type CellValue = string | number | boolean | null
export type WorkbookSheet = {
    name: string;
    rows: number;
    columns: number;
    headers: string[];
    data: CellValue[][];
    dataRange: string
}
export type Workbook = {
    workbookId: string;
    fileName: string;
    fileSize: number;
    sheets: WorkbookSheet[]
}
