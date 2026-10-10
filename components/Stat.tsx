import CopyButton from './CopyButton'

/** A labelled result figure, matching the compound interest results card. */
export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-sans text-subdued mb-1">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="font-condensed text-[40px] text-black leading-none">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  )
}
