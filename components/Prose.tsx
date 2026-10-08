/** Typography for the explanation section on calculator pages. */
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-[15px] text-black leading-relaxed space-y-3 [&_h2]:font-bold [&_h2]:text-[20px] [&_h2]:mb-3 [&_h3]:font-bold [&_h3]:text-[15px] [&_h3]:pt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline [&_a:hover]:text-irn [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:font-bold [&_th]:py-2 [&_th]:pr-3 [&_th]:border-b [&_th]:border-black/10 [&_td]:py-2 [&_td]:pr-3 [&_td]:border-b [&_td]:border-black/5 [&_td]:tabular-nums">
      {children}
    </div>
  )
}
