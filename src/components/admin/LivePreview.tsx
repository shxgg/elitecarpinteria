import { useState } from 'react';
import { Monitor, Smartphone, CreditCard, Mail } from 'lucide-react';
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
          
          {/* Header & Barra Superior */}
          <div className="bg-charcoal px-3 py-1.5 text-center text-[8px] font-semibold text-white/80">
            {s.header_announcement || 'Fabricación propia · Envíos a todo el país'}
          </div>
          <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
            <img src={s.logo_url || '/logo.png'} className="h-8 object-contain" alt="Logo" />
          </div>

          {/* Hero */}
          <section className="relative min-h-[180px] overflow-hidden bg-charcoal text-white flex items-end p-4">
            <img src={s.hero_image_url || '/logo.png'} className="absolute inset-0 h-full w-full object-cover opacity-55" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent" />
            <div className="relative z-10">
              <p className="text-[8px] font-bold uppercase text-amber-200">Elite / Diseño de origen</p>
              <h3 className="mt-1 font-display text-xl leading-none">{s.hero_title || 'Título del Hero'}</h3>
            </div>
          </section>

          <div className="p-4 space-y-4 bg-white text-xs">
            {/* Modos de Pago */}
            <div className="border-b pb-3">
              <p className="font-bold text-wood flex items-center gap-1"><CreditCard size={12}/> Modos de Pago</p>
              <p className="font-semibold">{s.payment_title || 'Medios de Pago'}</p>
              <p className="text-stone">{s.payment_text}</p>
              {s.payment_image_url && <img src={s.payment_image_url} alt="Pagos" className="mt-2 h-10 object-contain" />}
            </div>

            {/* Formulario / Contacto */}
            <div className="border-b pb-3">
              <p className="font-bold text-wood flex items-center gap-1"><Mail size={12}/> Contacto</p>
              <p className="font-semibold">{s.contact_title || 'Hablemos de tu espacio'}</p>
              <p className="text-stone">{s.contact_subtitle}</p>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-charcoal p-4 text-center text-[9px] text-white/70">
            <p>{s.phone} · {s.email}</p>
            <p className="mt-1 text-white/40">{s.footer_text || 'Elite Carpintería © Todos los derechos reservados'}</p>
          </footer>

        </div>
      </div>
    </aside>
  );
}