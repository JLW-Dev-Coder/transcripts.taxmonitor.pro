import type { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  className?: string
}

interface DataTableProps {
  columns: Column[]
  rows: Record<string, ReactNode>[]
  emptyMessage?: string
}

export default function DataTable({ columns, rows, emptyMessage = 'No data' }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[--member-border] bg-[--member-card]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[--member-border]">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-white/40 ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-sm text-white/30">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[--member-border] transition last:border-b-0 hover:bg-[--member-card-hover]"
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-5 py-3.5 text-white/70 ${col.className ?? ''}`}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
