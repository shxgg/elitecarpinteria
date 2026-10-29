import { ReactNode } from 'react';

export function SectionCard({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-charcoal/10 pb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-white">{n}</span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}