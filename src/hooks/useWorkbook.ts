import {useRef, useState} from 'react'
import {parseExcelFile} from '../services/excelParser'
import {uploadWorkbook} from '../services/apiClient'
import type {Workbook} from '../types/workbook'

export function useWorkbook() {
    const [workbook, setWorkbook] = useState<Workbook | null>(null)
    const [sheetName, setSheetNameState] = useState('')
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [error, setError] = useState('')
    const fileRef = useRef<File | null>(null)
    const requestRef = useRef(0)

    const upload = async (file: File) => {
        if (!/\.xlsx$/i.test(file.name)) {
            setError('仅支持 .xlsx 文件')
            setStatus('error')
            return
        }
        if (file.size > 20 * 1024 * 1024) {
            setError('文件不能超过 20 MB')
            setStatus('error')
            return
        }
        const request = ++requestRef.current
        setStatus('uploading')
        setError('')
        setWorkbook(null)
        setSheetNameState('')
        try {
            const [remote, local] = await Promise.all([uploadWorkbook(file), parseExcelFile(file)])
            if (request !== requestRef.current) return
            fileRef.current = file
            setWorkbook({...local, workbookId: remote.workbook_id})
            setSheetNameState(remote.sheet_name)
            setStatus('success')
        } catch (cause) {
            if (request !== requestRef.current) return
            setError(cause instanceof Error ? cause.message : '文件上传失败')
            setStatus('error')
        }
    }

    const setSheetName = async (name: string) => {
        if (!workbook || !fileRef.current || name === sheetName) return
        const request = ++requestRef.current
        setStatus('uploading')
        setError('')
        try {
            const remote = await uploadWorkbook(fileRef.current, name)
            if (request !== requestRef.current) return
            if (remote.sheet_name !== name) throw new Error('后端未选择指定工作表。')
            setWorkbook({...workbook, workbookId: remote.workbook_id})
            setSheetNameState(remote.sheet_name)
            setStatus('success')
        } catch (cause) {
            if (request !== requestRef.current) return
            setError(cause instanceof Error ? cause.message : '工作表切换失败')
            setStatus('success')
        }
    }

    return {
        workbook, sheetName, setSheetName, status, error, upload,
        activeSheet: workbook?.sheets.find((sheet) => sheet.name === sheetName),
    }
}
