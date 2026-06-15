import ReceiptParser, { meta as receiptMeta } from './receiptParser'
import PulseFit, { meta as pulseFitMeta } from './pulseFit'

// To add a demo: create one file in src/demos and add it to the DEMOS array.
export const DEMOS = [
  { ...pulseFitMeta, Component: PulseFit },
  { ...receiptMeta, Component: ReceiptParser },
]

export function Demos({ Head }) {
  return (
    <section id="demos" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface border-y border-line">
      <div className="max-w-7xl mx-auto">
        {Head && (
          <Head index="05" kicker="Try it" title="Live demos you can use right here" sub="Small working examples that run in your browser. No sign-up, no redirect." />
        )}
        <div className="grid gap-8 mt-14">
          {DEMOS.map(({ id, title, blurb, tags, Component }) => (
            <div key={id} className="reveal card p-7 sm:p-8">
              <h3 className="font-display font-bold text-xl text-ink">{title}</h3>
              <p className="text-muted text-[15px] mt-2 leading-relaxed">{blurb}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <div className="mt-6">
                <Component />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
