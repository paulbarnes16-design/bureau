import Card from './Card'

/**
 * The direct answer at the top of a question page: the question as the page heading,
 * the headline figure, one sentence of context and a small table of common variations.
 */
export default function AnswerCard({
  question,
  figure,
  figureLabel,
  sentence,
  table,
  note,
}: {
  question: string
  figure: string
  figureLabel: string
  sentence: React.ReactNode
  /** `hideOnMobile`: column indexes dropped on narrow screens so the table fits */
  table: { head: string[]; rows: string[][]; highlight?: number; hideOnMobile?: number[] }
  note?: string
}) {
  const hidden = (col: number) => (table.hideOnMobile?.includes(col) ? 'hidden sm:table-cell' : '')
  return (
    <Card className="p-5">
      <h1 className="font-sans font-bold text-[20px] text-black mb-4">{question}</h1>
      <p className="text-sm font-sans text-subdued mb-1">{figureLabel}</p>
      <p className="font-condensed text-[40px] text-black leading-none mb-4">{figure}</p>
      <p className="text-[18px] font-sans text-black leading-relaxed mb-5 max-w-3xl">{sentence}</p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm font-sans border-collapse">
          <thead>
            <tr className="bg-black/[0.06]">
              {table.head.map((h, j) => (
                <th key={h} className={`text-left text-xs font-bold text-black px-3 py-3 whitespace-nowrap ${hidden(j)}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} className={i === table.highlight ? 'font-bold' : ''}>
                {row.map((cell, j) => (
                  <td key={j} className={`px-3 py-3 text-black border-b border-black/[0.06] whitespace-nowrap ${hidden(j)}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="text-[11px] font-sans text-subdued mt-3">{note}</p>}
    </Card>
  )
}
