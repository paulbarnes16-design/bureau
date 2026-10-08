import Card from './Card'
import FAQ from './FAQ'
import type { FaqItem } from '@/lib/schemas'

/** Layout for the smaller calculators: inputs left, results and FAQs right (stacked on mobile). */
export default function ToolLayout({
  inputs,
  result,
  faqs,
}: {
  inputs: React.ReactNode
  result: React.ReactNode
  faqs: FaqItem[]
}) {
  return (
    <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
      <div className="lg:col-span-4">
        <Card className="p-5">
          <h2 className="font-sans font-bold text-[20px] text-black mb-4">Input values</h2>
          <div className="space-y-5">{inputs}</div>
        </Card>
      </div>
      <div className="space-y-3 lg:space-y-10 lg:col-span-8">
        <Card className="p-5">{result}</Card>
        <Card className="p-5">
          <h2 className="font-sans font-bold text-[20px] text-black mb-3">FAQs</h2>
          <FAQ faqs={faqs} />
        </Card>
      </div>
    </div>
  )
}
