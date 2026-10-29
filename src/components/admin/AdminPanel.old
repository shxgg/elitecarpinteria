import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LogOut, Save } from 'lucide-react';
import { supabase } from '../../supabase';
import { ImageField } from './ImageField';
import { LivePreview } from './LivePreview';
import { SectionCard } from './SectionCard';
import { ProductManager } from './ProductManager';

export type SiteSettings = {
  hero_title: string;
  hero_image_url: string;
  phone: string;
  email: string;
  whatsapp: string;
  favicon_url: string;
  logo_url: string;
  header_announcement: string;
  about_title: string;
  about_text: string;
  about_image: string;
  custom_title: string;
  custom_text: string;
  custom_image_url: string;
  materials_title: string;
  materials_text: string;
  materials_image_url: string;
  payment_title: string;
  payment_text: string;
  payment_image_url: string;
  contact_title: string;
  contact_subtitle: string;
  footer_text: string;
};

type Props = {
  navigate: (path: string) => void;
  categories: string[];
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
  onCategoryAdded: () => void;
};

const DEFAULTS: SiteSettings = {
  hero_title: '', hero_image_url: '', phone: '', email: '', whatsapp: '', favicon_url: '/logo.png', logo_url: '/logo.png',
  header_announcement: '', about_title: '', about_text: '', about_image: '', custom_title: '', custom_text: '', custom_image_url: '',
  materials_title: '', materials_text: '', materials_image_url: '', payment_title: '', payment_text: '', payment_image_url: '',
  contact_title: '', contact_subtitle: '', footer_text: '',
};

const normalize = (s: Partial<SiteSettings>): SiteSettings => ({ ...DEFAULTS, ...s });

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = 'w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-wood focus:ring-2 focus:ring-wood/10';
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.13em] text-charcoal/60">{label}</span>{multiline ? <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} className={cls} /> : <input value={value} onChange={e => onChange(e.target.value)} className={cls} />}</label>;
}

export function AdminPanel({ navigate, categories, settings, onSettingsChange, onCategoryAdded }: Props) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [draft, setDraft] = useState<SiteSettings>(normalize(settings));
  const [files, setFiles] = useState<Partial<Record<keyof SiteSettings, File>>>({});
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setDbProducts(data);
  };

  useEffect(() => { setDraft(normalize(settings)); }, [settings]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    loadProducts();
  }, []);
  
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(normalize(settings)) || Object.keys(files).length > 0, [draft, settings, files]);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setDraft(d => ({ ...d, [key]: value }));

  const login = async (e: FormEvent) => { e.preventDefault(); setError(''); const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setError(error.message); else setUser(data.user); };
  const upload = async (file: File, prefix: string) => { const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'; const path = `${prefix}-${crypto.randomUUID()}.${ext}`; const { error } = await supabase.storage.from('product-images').upload(path, file); if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl; };

  const save = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      const next = { ...draft };
      for (const key of ['hero_image_url','about_image','custom_image_url','materials_image_url','logo_url','favicon_url','payment_image_url'] as (keyof SiteSettings)[]) {
        if (files[key]) next[key] = await upload(files[key]!, String(key).replace('_url',''));
      }
      const { error } = await supabase.from('site_settings').update(next).eq('id', 1);
      if (error) throw error;
      setDraft(next); setFiles({}); onSettingsChange(next); setMessage('Cambios guardados y sincronizados correctamente.');
    } catch (e: any) { setError(e?.message || 'No se pudieron guardar los cambios.'); } finally { setSaving(false); }
  };

  const addCategory = async (e: FormEvent) => { e.preventDefault(); const name = newCategory.trim(); if (!name) return; const { error } = await supabase.from('categories').insert([{ name }]); if (error) setError(error.message); else { setNewCategory(''); onCategoryAdded(); setMessage('Categoría creada.'); } };

  if (!user) return <div className="min-h-screen bg-bone px-5 py-16"><form onSubmit={login} className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl"><button type="button" onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase text-stone"><ArrowLeft size={16}/> Sitio web</button><h1 className="font-display text-3xl">Panel Administrador</h1>{error && <p className="mt-4 rounded bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="mt-6 space-y-4"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border p-3 text-sm"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded-lg border p-3 text-sm"/><button className="w-full rounded-lg bg-charcoal py-3 text-xs font-bold uppercase text-white">Iniciar sesión</button></div></form></div>;

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b bg-white/90 px-5 py-3">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <button onClick={()=>navigate('/')} className="flex items-center gap-2 text-xs font-bold uppercase text-stone"><ArrowLeft size={16}/> Sitio web</button>
          <div className="flex items-center gap-4">
            {dirty && <span className="text-[10px] font-bold uppercase text-amber-700">Cambios sin guardar</span>}
            <button onClick={()=>supabase.auth.signOut().then(()=>setUser(null))} className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-600"><LogOut size={14}/> Salir</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] gap-6 p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-wood">CMS Visual Profesional</p>
            <h1 className="mt-2 font-display text-4xl">Contenido y diseño</h1>
          </div>
          {(message || error) && <div className={`rounded-xl p-4 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{error || message}</div>}
          
          <form onSubmit={save} className="space-y-6">
            
            {/* 01. ENCABEZADO Y FOOTER */}
            <SectionCard n="01" title="Encabezado y Footer">
              <div className="space-y-4">
                <Field label="Texto barra superior (Header Notice)" value={draft.header_announcement} onChange={v => set('header_announcement', v)} />
                <Field label="Texto Copyright Footer" value={draft.footer_text} onChange={v => set('footer_text', v)} />
                <div className="grid gap-6 lg:grid-cols-2 pt-2">
                  <div><h3 className="mb-2 text-xs font-bold uppercase">Logo (Header)</h3><ImageField name="logo_url" value={draft.logo_url} onChange={v => set('logo_url', v)} file={files.logo_url} onFile={f => setFiles(x => ({ ...x, logo_url: f }))} /></div>
                  <div><h3 className="mb-2 text-xs font-bold uppercase">Favicon (Pestaña)</h3><ImageField name="favicon_url" value={draft.favicon_url} onChange={v => set('favicon_url', v)} file={files.favicon_url} onFile={f => setFiles(x => ({ ...x, favicon_url: f }))} /></div>
                </div>
              </div>
            </SectionCard>
            
            {/* 02. HOME / HERO */}
            <SectionCard n="02" title="Home / Hero">
              <div className="space-y-5">
                <Field label="Título principal" value={draft.hero_title} onChange={v=>set('hero_title',v)}/>
                <ImageField name="hero_image_url" value={draft.hero_image_url} onChange={v=>set('hero_image_url',v)} file={files.hero_image_url} onFile={f=>setFiles(x=>({...x,hero_image_url:f}))}/>
              </div>
            </SectionCard>

            {/* 03. A MEDIDA */}
            <SectionCard n="03" title="A medida">
              <div className="space-y-5">
                <Field label="Título" value={draft.custom_title} onChange={v=>set('custom_title',v)}/>
                <Field label="Texto" multiline value={draft.custom_text} onChange={v=>set('custom_text',v)}/>
                <ImageField name="custom_image_url" value={draft.custom_image_url} onChange={v=>set('custom_image_url',v)} file={files.custom_image_url} onFile={f=>setFiles(x=>({...x,custom_image_url:f}))}/>
              </div>
            </SectionCard>

            {/* 04. MATERIALES */}
            <SectionCard n="04" title="Materiales">
              <div className="space-y-5">
                <Field label="Título" value={draft.materials_title} onChange={v=>set('materials_title',v)}/>
                <Field label="Texto" multiline value={draft.materials_text} onChange={v=>set('materials_text',v)}/>
                <ImageField name="materials_image_url" value={draft.materials_image_url} onChange={v=>set('materials_image_url',v)} file={files.materials_image_url} onFile={f=>setFiles(x=>({...x,materials_image_url:f}))}/>
              </div>
            </SectionCard>

            {/* 05. NOSOTROS */}
            <SectionCard n="05" title="Nosotros">
              <div className="space-y-5">
                <Field label="Título" value={draft.about_title} onChange={v=>set('about_title',v)}/>
                <Field label="Texto" multiline value={draft.about_text} onChange={v=>set('about_text',v)}/>
                <ImageField name="about_image" value={draft.about_image} onChange={v=>set('about_image',v)} file={files.about_image} onFile={f=>setFiles(x=>({...x,about_image:f}))}/>
              </div>
            </SectionCard>

            {/* 06. MODOS DE PAGO */}
            <SectionCard n="06" title="Modos de Pago">
              <div className="space-y-4">
                <Field label="Título de la sección" value={draft.payment_title} onChange={v => set('payment_title', v)} />
                <Field label="Texto aclaratorio / Promociones" multiline value={draft.payment_text} onChange={v => set('payment_text', v)} />
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase">Imagen de tarjetas / Banner de Pagos</h3>
                  <ImageField name="payment_image_url" value={draft.payment_image_url} onChange={v => set('payment_image_url', v)} file={files.payment_image_url} onFile={f => setFiles(x => ({ ...x, payment_image_url: f }))} />
                </div>
              </div>
            </SectionCard>

            {/* 07. CONTACTO Y FORMULARIO */}
            <SectionCard n="07" title="Contacto y Formulario">
              <div className="space-y-4">
                <Field label="Título de la sección" value={draft.contact_title} onChange={v => set('contact_title', v)} />
                <Field label="Subtítulo / Texto descriptivo" value={draft.contact_subtitle} onChange={v => set('contact_subtitle', v)} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Teléfono" value={draft.phone} onChange={v => set('phone', v)} />
                  <Field label="Email" value={draft.email} onChange={v => set('email', v)} />
                  <Field label="WhatsApp (solo números)" value={draft.whatsapp} onChange={v => set('whatsapp', v)} />
                </div>
              </div>
            </SectionCard>

            <button disabled={saving} className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl disabled:opacity-60">
              <Save size={16}/>{saving ? 'Guardando…' : 'Guardar y sincronizar'}
            </button>
          </form>
          
          {/* GESTIÓN DE PRODUCTOS Y PRECIOS */}
          <SectionCard n="08" title="Gestión de Muebles y Precios">
            <ProductManager products={dbProducts} categories={categories} onProductChanged={loadProducts} />
          </SectionCard>

          {/* GESTIÓN DE CATEGORÍAS */}
          <SectionCard n="09" title="Categorías">
            <div className="flex flex-wrap gap-2">{categories.map(c=><span key={c} className="rounded-full border bg-bone px-3 py-1.5 text-xs font-semibold">{c}</span>)}</div>
            <form onSubmit={addCategory} className="mt-4 flex gap-2">
              <input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Nueva categoría" className="flex-1 rounded-lg border p-3 text-sm"/>
              <button className="rounded-lg bg-charcoal px-5 text-xs font-bold uppercase text-white">Agregar</button>
            </form>
          </SectionCard>
        </div>
        <LivePreview s={draft}/>
      </div>
    </div>
  );
}