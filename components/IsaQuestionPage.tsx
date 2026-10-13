import IsaCalculator from './IsaCalculator'
import SiteShell from './SiteShell'
import { ISA_DEFAULTS, type IsaInputs } from '@/lib/isa'
import { buildAppSchema, buildFaqSchema, type FaqItem } from '@/lib/schemas'
import { SITE_URL } from '@/lib/tools'

/** A question page: the ISA calculator pre-filled to answer one specific question. */
export default function IsaQuestionPage({
  path,
  question,
  description,
  inputs,
  faqs,
}: {
  path: string
  question: string
  description: string
  inputs: Partial<IsaInputs>
  faqs: FaqItem[]
}) {
  return (
    <SiteShell
      title={question}
      currentHref={path}
      schemas={[buildAppSchema(`${SITE_URL}${path}`, description, 'GBP', 'ISA Calculator'), buildFaqSchema(faqs)]}
    >
      <IsaCalculator defaults={{ ...ISA_DEFAULTS, ...inputs }} faqs={faqs} startIso={new Date().toISOString()} />
    </SiteShell>
  )
}
