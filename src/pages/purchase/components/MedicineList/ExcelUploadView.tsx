import { useRef, useState, useCallback } from 'react'
import { UploadCloud, FileSpreadsheet, X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { read, utils } from 'xlsx'
import { cn } from '@/lib/utils'
import type { Medicine } from '@/pages/purchase/types/purchase.types'

interface ExcelUploadViewProps {
  medicines: Medicine[]
  catalogMedicines: Medicine[]
  onMedicinesLoaded: (medicines: Medicine[]) => void
  selectedId: string | null
  onSelect: (medicine: Medicine) => void
  checkedIds: string[]
  onToggleCheck: (id: string) => void
  cartQtyByMedicine: Record<string, number>
}

interface ParseError {
  row: number
  message: string
}

interface ParsedRow {
  rowNum: number
  name: string
  mnn: string
  manufacturer: string
  country: string
}

// Try to detect column index by matching keywords
function detectCol(headers: string[], ...keywords: string[]): number {
  return headers.findIndex((h) =>
    keywords.some((kw) => h.toLowerCase().includes(kw.toLowerCase()))
  )
}

function parseSheet(data: unknown[][]): { rows: ParsedRow[]; errors: ParseError[] } {
  if (!data || data.length < 2) return { rows: [], errors: [{ row: 0, message: 'Файл пустой или не содержит данных' }] }

  const rawHeaders = data[0].map((h) => String(h ?? ''))
  const nameCol    = detectCol(rawHeaders, 'назван', 'наимен', 'препарат', 'лекарств', 'товар', 'продукт')
  const mnnCol     = detectCol(rawHeaders, 'мнн', 'mnn', 'международн', 'непатент')
  const mfgCol     = detectCol(rawHeaders, 'произв', 'фирм', 'бренд', 'компан')
  const countryCol = detectCol(rawHeaders, 'стран', 'country')

  const errors: ParseError[] = []
  const rows: ParsedRow[] = []

  // Need at least a name column OR an MNN column to work with
  if (nameCol === -1 && mnnCol === -1) {
    errors.push({ row: 0, message: 'Не найдена колонка с названием или МНН лекарства. Ожидаются заголовки: МНН, Название, Наименование, Препарат и т.п.' })
    return { rows, errors }
  }

  data.slice(1).forEach((row, i) => {
    const rowNum = i + 2
    const name = nameCol !== -1 ? String(row[nameCol] ?? '').trim() : ''
    const mnn  = mnnCol  !== -1 ? String(row[mnnCol]  ?? '').trim() : ''

    if (!name && !mnn) return // skip empty rows

    const manufacturer = mfgCol     !== -1 ? String(row[mfgCol]     ?? '').trim() : ''
    const country      = countryCol !== -1 ? String(row[countryCol] ?? '').trim() : ''

    rows.push({ rowNum, name, mnn, manufacturer, country })
  })

  if (rows.length === 0) {
    errors.push({ row: 0, message: 'Не удалось извлечь позиции из файла' })
  }

  return { rows, errors }
}

function matchWithCatalog(
  rows: ParsedRow[],
  catalog: Medicine[]
): { medicines: Medicine[]; unmatchedIds: Set<string> } {
  const medicines: Medicine[] = []
  const unmatchedIds = new Set<string>()

  rows.forEach((row) => {
    // Try to match by MNN (primary) or by name (fallback)
    let matched: Medicine | undefined

    if (row.mnn) {
      const q = row.mnn.toLowerCase()
      matched = catalog.find(
        (m) =>
          m.mnn.toLowerCase() === q ||
          (m.mnnLatin != null && m.mnnLatin.toLowerCase() === q)
      )
    }

    if (!matched && row.name) {
      matched = catalog.find(
        (m) => m.name.toLowerCase() === row.name.toLowerCase()
      )
    }

    if (matched) {
      // Use catalog medicine (has correct id, name, mnn, etc.)
      // Avoid duplicates if same medicine matched multiple times
      if (!medicines.find((m) => m.id === matched!.id)) {
        medicines.push(matched)
      }
    } else {
      // Create a stub medicine from Excel data
      const stubId = `unmatched-${row.rowNum}`
      if (!medicines.find((m) => m.id === stubId)) {
        medicines.push({
          id: stubId,
          name: row.name || row.mnn || `Строка ${row.rowNum}`,
          mnn: row.mnn,
          manufacturer: row.manufacturer || '—',
          country: row.country || '—',
          isFavorite: false,
        })
        unmatchedIds.add(stubId)
      }
    }
  })

  return { medicines, unmatchedIds }
}

export function ExcelUploadView({
  medicines,
  catalogMedicines,
  onMedicinesLoaded,
  selectedId,
  onSelect,
  checkedIds,
  onToggleCheck,
  cartQtyByMedicine,
}: ExcelUploadViewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [errors, setErrors] = useState<ParseError[]>([])
  const [loading, setLoading] = useState(false)
  const [unmatchedIds, setUnmatchedIds] = useState<Set<string>>(new Set())

  async function processFile(file: File) {
    setLoading(true)
    setErrors([])
    setFileName(file.name)
    try {
      const buf = await file.arrayBuffer()
      const wb = read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
      const { rows, errors: errs } = parseSheet(data as unknown[][])
      setErrors(errs)
      if (rows.length > 0) {
        const { medicines: matched, unmatchedIds: unmatched } = matchWithCatalog(rows, catalogMedicines)
        setUnmatchedIds(unmatched)
        onMedicinesLoaded(matched)
      }
    } catch {
      setErrors([{ row: 0, message: 'Не удалось прочитать файл. Убедитесь, что это корректный .xlsx, .xls или .csv файл.' }])
    }
    setLoading(false)
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  function handleClear() {
    setFileName('')
    setErrors([])
    setUnmatchedIds(new Set())
    onMedicinesLoaded([])
    if (inputRef.current) inputRef.current.value = ''
  }

  const matchedCount   = medicines.filter((m) => !unmatchedIds.has(m.id)).length
  const unmatchedCount = unmatchedIds.size

  // ── Upload zone (no file loaded yet) ──
  if (!fileName && medicines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full max-w-sm cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            isDragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <div className="rounded-xl bg-gray-100 p-4">
            <UploadCloud className={cn('h-8 w-8 transition-colors', isDragging ? 'text-gray-900' : 'text-gray-400')} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Отпустите файл' : 'Перетащите файл или нажмите'}
            </p>
            <p className="mt-1 text-xs text-gray-400">Поддерживаются .xlsx, .xls, .csv</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-gray-500" />
            Выбрать файл
          </button>
        </div>

        <p className="mt-4 max-w-sm text-center text-xs text-gray-400">
          Файл должен содержать колонку <span className="font-medium text-gray-500">МНН</span> — по ней система найдёт нужный препарат в каталоге. Дополнительно: Название, Производитель, Страна.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  // ── Error state ──
  if (errors.length > 0 && medicines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="rounded-xl bg-red-50 p-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Ошибка при загрузке</p>
          {errors.map((e, i) => (
            <p key={i} className="mt-1 text-xs text-red-500">{e.message}</p>
          ))}
        </div>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Попробовать снова
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
        <p className="text-sm text-gray-500">Обрабатываем файл...</p>
      </div>
    )
  }

  // ── List of loaded medicines ──
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* File summary bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700 max-w-[160px] truncate" title={fileName}>
              {fileName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-[#D1FAE5] px-2 py-0.5 text-xs font-medium text-[#065F46]">
              {matchedCount} найдено
            </span>
            {unmatchedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#92400E]">
                <AlertTriangle className="h-3 w-3" />
                {unmatchedCount} не найдено
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-3.5 w-3.5" />
          Очистить
        </button>
      </div>

      {/* Unmatched warning banner */}
      {unmatchedCount > 0 && (
        <div className="flex items-start gap-2.5 border-b border-[#FEF3C7] bg-[#FFFBEB] px-4 py-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
          <p className="text-xs text-[#92400E]">
            {unmatchedCount} {unmatchedCount === 1 ? 'препарат не найден' : 'препарата не найдено'} в каталоге по МНН. Возможно, МНН указан неверно или препарат отсутствует в системе.
          </p>
        </div>
      )}

      {/* Medicine list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {medicines.map((medicine) => {
          const isSelected  = medicine.id === selectedId
          const isChecked   = checkedIds.includes(medicine.id)
          const cartQty     = cartQtyByMedicine[medicine.id] ?? 0
          const isUnmatched = unmatchedIds.has(medicine.id)

          return (
            <div
              key={medicine.id}
              onClick={() => !isUnmatched && onSelect(medicine)}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 transition-colors',
                isUnmatched
                  ? 'cursor-default opacity-60'
                  : isSelected
                  ? 'cursor-pointer bg-gray-100'
                  : 'cursor-pointer hover:bg-gray-50'
              )}
            >
              {isSelected && !isUnmatched && (
                <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-sm bg-gray-900" />
              )}
              <input
                type="checkbox"
                checked={isChecked}
                disabled={isUnmatched}
                onChange={() => {}}
                onClick={(e) => {
                  if (isUnmatched) return
                  e.stopPropagation()
                  onToggleCheck(medicine.id)
                }}
                className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 accent-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-sm', isSelected && !isUnmatched ? 'font-semibold text-gray-900' : 'font-medium text-gray-900')}>
                  {medicine.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {medicine.mnn
                    ? <><span className="text-gray-400">МНН: </span>{medicine.mnn}{medicine.manufacturer !== '—' ? ` · ${medicine.manufacturer}` : ''}</>
                    : <>{medicine.manufacturer}{medicine.country !== '—' ? ` (${medicine.country})` : ''}</>
                  }
                </p>
              </div>
              {isUnmatched ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#92400E]">
                  <AlertTriangle className="h-3 w-3" />
                  Не в каталоге
                </span>
              ) : cartQty > 0 ? (
                <span className="flex-shrink-0 inline-flex items-center rounded-full bg-[#D1FAE5] px-2 py-0.5 text-xs font-semibold text-[#065F46]">
                  {cartQty} уп.
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          handleClear()
          setTimeout(() => handleFile(e.target.files?.[0]), 50)
        }}
      />
    </div>
  )
}
