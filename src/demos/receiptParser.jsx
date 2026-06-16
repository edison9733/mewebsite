import { useState } from 'react'

export const meta = {
  id: 'receipt-parser',
  title: 'LHDN receipt parser',
  blurb: "A browser-only taste of the LHDN bot's first step — paste a messy receipt line and watch it pull out merchant, amount, and date. The live bot does this from a photo with a vision model.",
  tags: ['client-side', 'parsing', 'LHDN'],
}

function parseReceipt(line) {
  const dateMatch = line.match(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/)
  const date = dateMatch ? dateMatch[0] : '—'

  const amountMatch = line.match(/\b\d+\.\d+\b/)
  const amount = amountMatch ? amountMatch[0] : (line.match(/\b\d+\b/)?.[0] ?? '—')

  const merchantMatch = line.match(/^[^\d]+/)
  const merchant = merchantMatch ? merchantMatch[0].trim() : '—'

  return { merchant, amount, date }
}

export default function ReceiptParser() {
  const [line, setLine] = useState('Starbucks KLCC  RM 18.90  12/06/2026')
  const { merchant, amount, date } = parseReceipt(line)

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={line}
        onChange={e => setLine(e.target.value)}
        aria-label="Receipt line to parse"
        className="w-full bg-paper border border-line rounded-xl px-4 py-3 text-ink font-mono text-sm focus:outline-none focus:border-ink transition-colors"
        placeholder="Paste a receipt line…"
      />
      <div className="grid grid-cols-3 gap-3">
        {[['Merchant', merchant], ['Amount', amount], ['Date', date]].map(([label, value]) => (
          <div key={label} className="bg-surface border border-line rounded-xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</p>
            <p className="text-ink font-semibold mt-1 truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
