import { List, Trash2 } from "lucide-react";

export default function TableRow({ row, rowNumber, onDelete }) {
  return (
    <tr className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0">
      <td className="px-4 font-normal text-text-secondary">{rowNumber}</td>
      <td className="px-4 font-normal text-text-secondary">{row.month}</td>
      <td className="px-4">{row.year}</td>
      <td className="px-4">{row.department}</td>
      <td className="px-4">{row.monthlyRiel}</td>
      <td className="px-4">{row.monthlyUsd}</td>
      <td className="px-4">{row.total}</td>
      <td className="px-4">
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="inline-flex h-5 items-center gap-1 rounded-full bg-secondary px-2.5 text-[10px] font-semibold text-white transition hover:bg-secondary-hover">
            <List size={11} strokeWidth={2} />
            លម្អិត
          </button>
          <button
            type="button"
            className="text-error transition hover:text-red-700"
            aria-label={`Delete donation row ${row.id}`}
            onClick={() => onDelete(row.id)}
          >
            <Trash2 size={17} strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}
