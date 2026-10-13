import { calculateIsa, ISA_DEFAULTS, type IsaInputs } from './isa'

/** Fixed start date for worked examples in page text, so the wording stays stable. */
const EXAMPLE_START = new Date(2026, 9, 1)

/** Empty balances and payments, to build examples from. */
export const EMPTY: Partial<IsaInputs> = { cashBalance: 0, sharesBalance: 0, cashMonthly: 0, sharesMonthly: 0 }

export const isaExample = (x: Partial<IsaInputs>) => calculateIsa({ ...ISA_DEFAULTS, ...x }, EXAMPLE_START)
