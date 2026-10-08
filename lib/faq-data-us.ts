export const faqsUS = [
  {
    question: 'What is compound interest?',
    answer:
      'Compound interest is interest calculated on both your initial deposit and the interest you\'ve already earned. Unlike simple interest — which only accrues on your principal — compound interest means your money grows exponentially over time, often described as "interest on interest".\n\nThe formula is: A = P × (1 + r/n)^(n×t)\n\nWhere A is the final amount, P is your principal (starting balance), r is the annual interest rate as a decimal, n is how many times interest compounds per year, and t is the number of years. For example, $1,000 at 5% compounded monthly for 10 years: A = 1,000 × (1 + 0.05/12)^(12×10) = $1,647.',
  },
  {
    question: 'How does compound interest work, year by year?',
    answer:
      'Each year you earn interest on your balance, and that interest is added to the balance, so next year\'s interest is a little bigger. Take $10,000 at 5% compounded yearly:\n\nYear 1: $10,000 earns $500, giving $10,500.\nYear 2: $10,500 earns $525, giving $11,025.\nYear 3: $11,025 earns $551.25, giving $11,576.25.\n\nThe yearly interest keeps growing. By year 10 the balance is $16,288.95, and that year alone earns $775.66. By year 30 it is $43,219.42, with $2,058.07 earned in the final year — four times the first year\'s interest from the same starting deposit. Open the Table view in this calculator to see this breakdown for your own numbers.',
  },
  {
    question: 'How much will $10,000 grow in 10 years?',
    answer:
      'With interest compounded monthly and no further deposits, $10,000 left for 10 years grows to:\n\nAt 3%: $13,494\nAt 5%: $16,470\nAt 7%: $20,097\n\nThe rate makes a big difference over time — moving from 3% to 7% adds over $6,600 on the same deposit. These figures are before tax, fees and inflation. Enter your own amount, rate and timeframe above to see your exact result.',
  },
  {
    question: 'How do regular monthly contributions grow with compound interest?',
    answer:
      'Every contribution starts compounding from the day it is added, so regular saving builds much faster than the deposits alone. The future value of regular contributions is: FV = PMT × ((1 + r/n)^(n×t) − 1) ÷ (r/n)\n\nWhere PMT is the amount you pay in each period, r is the annual interest rate as a decimal, n is the number of periods per year and t is the number of years.\n\nFor example, $200 a month at 7% compounded monthly for 30 years grows to about $243,994. You pay in $72,000, so roughly $172,000 of the final pot is interest. Add your contributions in the "Additional contributions" field to include them in your result.',
  },
  {
    question: 'Can compound interest work against you?',
    answer:
      'Yes — debt compounds too. If you owe $1,000 on a credit card charging 24.9% APR, compounded monthly, and make no payments, the balance grows to about $1,279 after one year and $3,429 after five years.\n\nThis is why paying off high-interest debt is often the best "return" available: clearing a 24.9% card balance saves more than most investments are likely to earn. Pay it off before focusing on savings and investments.',
  },
  {
    question: 'How is compound interest different from simple interest?',
    answer:
      'Simple interest is calculated only on your original investment. Compound interest is calculated on your principal plus any accumulated interest. Over long periods, the difference is dramatic: $10,000 at 7% simple interest for 30 years grows to $31,000, but with annual compounding it reaches $76,000 — more than twice as much.',
  },
  {
    question: 'Does inflation matter when calculating compound interest?',
    answer:
      'Inflation gradually reduces the real purchasing power of money. The US Federal Reserve targets 2% annual inflation, though actual inflation has varied significantly. If inflation runs at 3%, a pot of $100,000 in 10 years will only buy what $74,000 buys today. Use the "Adjust for inflation" toggle to see the real value of your future pot in today\'s dollars — it\'s the most honest way to plan for retirement or long-term goals.',
  },
  {
    question: 'What is a good rate of return to use?',
    answer:
      'The S&P 500 has historically returned around 10% annually (roughly 7% after inflation). For diversified US investors, a broad index fund like a total stock market fund has averaged 7–10% historically. A conservative estimate for long-term planning is 5–7% per year. Always account for fund expense ratios (typically 0.03–0.50%) and inflation when setting your expectations.',
  },
  {
    question: 'How does compound interest work in a 401(k) or IRA?',
    answer:
      'A 401(k) and Traditional IRA allow your investments to compound tax-deferred — meaning you don\'t pay taxes on gains until withdrawal in retirement. A Roth IRA and Roth 401(k) offer tax-free compounding: you pay taxes on contributions now, but all future growth and qualified withdrawals are tax-free.\n\nFor 2024, the 401(k) contribution limit is $23,000 ($30,500 if you\'re 50+), and the IRA limit is $7,000 ($8,000 if you\'re 50+). The tax advantages of these accounts can significantly amplify the effect of compound interest over decades.',
  },
  {
    question: 'Is compound interest taxable in the US?',
    answer:
      'Yes, in taxable brokerage accounts, interest and dividends are generally taxable in the year earned. Interest from savings accounts and CDs is taxed as ordinary income. Long-term capital gains (assets held over 1 year) are taxed at preferential rates of 0%, 15%, or 20% depending on your income.\n\nIn tax-advantaged accounts like 401(k)s and IRAs, you defer or eliminate this tax drag — which is one of the most powerful ways to accelerate compounding.',
  },
  {
    question: 'What is the Rule of 72?',
    answer:
      'The Rule of 72 is a quick mental shortcut: divide 72 by your annual interest rate to estimate how many years it takes to double your money. At 6%, your money doubles in roughly 12 years (72 ÷ 6). At 8%, it doubles in 9 years. At 10% (the S&P 500 historical average), it doubles in about 7.2 years. The rule works best for rates between 6% and 10%.',
  },
  {
    question: 'How much should I save each month to reach my goal?',
    answer:
      'A common starting benchmark is saving 15% of your gross income for retirement, including any employer 401(k) match. If you\'re starting late or have specific goals, you may need to save more.\n\nUse this calculator with your current balance, expected return, and time horizon to work backwards: adjust the monthly contribution until the future value matches your target. Many financial planners suggest aiming for 10–12× your final salary by retirement.',
  },
  {
    question: 'What are the best compound interest accounts in the US?',
    answer:
      'High-yield savings accounts (HYSAs) from online banks currently offer 4–5% APY and compound daily. Certificates of Deposit (CDs) offer fixed rates for a set term. Money market accounts offer similar rates with check-writing features.\n\nFor long-term growth, low-cost index funds in a 401(k) or IRA have historically outperformed savings accounts significantly. The best account depends on your time horizon: HYSAs and CDs for short-term savings, index funds for long-term wealth building.',
  },
  {
    question: 'How often should interest compound for the best returns?',
    answer:
      'More frequent compounding means slightly higher returns. Daily compounding beats monthly, which beats annual. However, the difference is smaller than most people think: $10,000 at 5% for 10 years grows to $16,289 compounded annually vs $16,487 compounded daily — a difference of about $200.\n\nThe interest rate itself matters far more than the compounding frequency. Focus on maximising your rate of return and contribution amount rather than optimising compounding frequency.',
  },
]
