import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { SiteSettings } from './AdminPanel';

export function LivePreview({ s }: { s: SiteSettings }) {
  const [mobile, setMobile] = useState(false);
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] min-h-[680px] overflow-hidden rounded-2xl bg-charcoal shadow-xl xl:flex xl:flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/50">Live Preview</p>
          <p className="text-sm font-semibold">Tiempo real</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1">
          <button onClick={() => setMobile(false)} className={`rounded p-1.5 ${!mobile ? 'bg-white/15' : ''}`}><Monitor size={15}/></button>
          <button onClick={() => setMobile(true)} className={`rounded p-1.5 ${mobile ? 'bg-white/15' : ''}`}><Smartphone size={15}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4">
        <div className={`mx-auto overflow-hidden border bg-bone shadow ${mobile ? 'max-w-[390px]' : ''}`}>
          <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
            <img src={s.logo_url || '/logo.png'} className="h-8 object-contain" alt="Logo" />
          </div>
          <section className="relative min-h-[220px] overflow-hidden bg-charcoal text-white flex items-end p-5">
            <img src={s.hero_image_url || '/logo.png'} className="absolute inset-0 h-full w-full object-cover opacity-55" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent" />
            <div className="relative z-10">
              <p className="text-[8px] font-bold uppercase text-amber-200">Elite / Diseño de origen</p>
              <h3 className="mt-2 font-display text-2xl leading-none">{s.hero_title || 'Título del Hero'}</h3>
            </div>
          </section>
          <div className="p-4 space-y-4 bg-white text-xs">
            <div className="border-b pb-3">
              <p className="font-bold text-wood">A medida</p>
              <p className="font-semibold">{s.custom_title}</p>
              <p className="text-stone">{s.custom_text}</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-bold text-wood">Materiales</p>
              <p className="font-semibold">{s.materials_title}</p>
              <p className="text-stone">{s.materials_text}</p>
            </div>
            <div>
              <p className="font-bold text-wood">Nosotros</p>
              <p className="font-semibold">{s.about_title}</p>
              <p className="text-stone">{s.about_text}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}