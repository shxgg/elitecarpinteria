import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Image as ImageIcon, LogOut, Monitor, Save, Smartphone, Upload, X } from 'lucide-react';
import { supabase } from '../supabase';

export type SiteSettings = {
  hero_title: string;
  hero_image_url: string;
  phone: string;
  email: string;
  whatsapp: string;
  favicon_url: string;
  logo_url: string;
  about_title: string;
  about_text: string;
  about_image: string;
  custom_title: string;
  custom_text: string;
  custom_image_url: string;
  materials_title: string;
  materials_text: string;
  materials_image_url: string;
  contact_title: string;
};

type Props = {
  navigate: (path: string) => void;
  categories: string[];
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
  onCategoryAdded: () => void;
};

type ImageSpec = { dimensions: string; ratio: string; formats: string; maxSize: string; hint: string };

const SPECS: Record<string, ImageSpec> = {
  hero_image_url: { dimensions: '1920 × 1080 px', ratio: '16:9', formats: 'JPG / WEBP', maxSize: '≤ 2 MB', hint: 'Banner horizontal; evitá texto importante cerca de los bordes.' },
  about_image: { dimensions: '1200 × 900 px', ratio: '4:3', formats: 'JPG / WEBP', maxSize: '≤ 1.5 MB', hint: 'Ideal para taller, equipo o proceso.' },
  custom_image_url: { dimensions: '1600 × 900 px', ratio: '16:9', formats: 'JPG / WEBP', maxSize: '≤ 2 MB', hint: 'Ideal para proyectos y ambientes completos.' },
  materials_image_url: { dimensions: '1600 × 900 px', ratio: '16:9', formats: 'JPG / WEBP', maxSize: '≤ 2 MB', hint: 'Usá una imagen nítida de placas, muestras o materiales.' },
  logo_url: { dimensions: '800 × 300 px', ratio: '≈ 8:3', formats: 'PNG / SVG / WEBP', maxSize: '≤ 500 KB', hint: 'Preferentemente fondo transparente.' },
  favicon_url: { dimensions: '32 × 32 px', ratio: '1:1', formats: 'PNG', maxSize: '≤ 100 KB', hint: 'PNG transparente; símbolo simple y legible.' },
};

const DEFAULTS: SiteSettings = {
  hero_title: '', hero_image_url: '', phone: '', email: '', whatsapp: '', favicon_url: '/logo.png', logo_url: '/logo.png',
  about_title: '', about_text: '', about_image: '', custom_title: '', custom_text: '', custom_image_url: '',
  materials_title: '', materials_text: '', materials_image_url: '', contact_title: '',
};

const normalize = (s: Partial<SiteSettings>): SiteSettings => ({ ...DEFAULTS, ...s });

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = 'w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-wood focus:ring-2 focus:ring-wood/10';
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.13em] text-charcoal/60">{label}</span>{multiline ? <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} className={cls} /> : <input value={value} onChange={e => onChange(e.target.value)} className={cls} />}</label>;
}

function ImageField({ name, value, onChange, file, onFile }: { name: keyof SiteSettings; value: string; onChange: (v: string) => void; file?: File; onFile: (f?: File) => void }) {
  const spec = SPECS[name];
  const [notice, setNotice] = useState('');
  const localUrl = file ? URL.createObjectURL(file) : value;
  const recommended: Record<string, [number, number]> = { hero_image_url: [1920, 1080], about_image: [1200, 900], custom_image_url: [1600, 900], materials_image_url: [1600, 900], logo_url: [800, 300], favicon_url: [32, 32] };

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    onFile(f);
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const [w, h] = recommended[name];
      setNotice(img.width === w && img.height === h ? `✓ Dimensiones exactas: ${w} × ${h}px` : `⚠ Detectado ${img.width} × ${img.height}px. Recomendado: ${w} × ${h}px.`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return <div className="space-y-3">
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-950">
      <div className="flex gap-2"><ImageIcon size={15} className="mt-0.5 shrink-0" /><div><b>Recomendado: {spec.dimensions} · {spec.ratio}</b><div>{spec.formats} · {spec.maxSize}</div><div className="mt-1 opacity-80">{spec.hint}</div></div></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
      <div className="aspect-[4/3] overflow-hidden rounded-lg border bg-stone-light">{localUrl ? <img src={localUrl} alt="Vista previa" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone"><ImageIcon /></div>}</div>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-xs font-bold uppercase tracking-wider hover:border-wood hover:text-wood"><Upload size={15} /> {file ? 'Cambiar imagen' : 'Seleccionar imagen'}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={change} /></label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="O pegá la URL pública" className="w-full rounded-lg border p-2.5 text-xs" />
        {notice && <p className={`text-[11px] ${notice.startsWith('✓') ? 'text-emerald-700' : 'text-amber-700'}`}>{notice}</p>}
      </div>
    </div>
  </div>;
}

function Card({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm lg:p-6"><div className="mb-5 flex items-center gap-3 border-b border-charcoal/10 pb-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-white">{n}</span><h2 className="font-display text-2xl">{title}</h2></div>{children}</section>;
}

function Preview({ s }: { s: SiteSettings }) {
  const [mobile, setMobile] = useState(false);
  return <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] min-h-[680px] overflow-hidden rounded-2xl bg-charcoal shadow-xl xl:flex xl:flex-col">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/50">Live Preview</p><p className="text-sm font-semibold">Sin guardar</p></div><div className="flex gap-1 rounded-lg border border-white/10 p-1"><button onClick={() => setMobile(false)} className={`rounded p-1.5 ${!mobile ? 'bg-white/15' : ''}`}><Monitor size={15}/></button><button onClick={() => setMobile(true)} className={`rounded p-1.5 ${mobile ? 'bg-white/15' : ''}`}><Smartphone size={15}/></button></div></div>
    <div className="flex-1 overflow-auto bg-white p-4"><div className={`mx-auto overflow-hidden border bg-bone shadow ${mobile ? 'max-w-[390px]' : ''}`}>
      <div className="flex items-center justify-between border-b px-4 py-3"><img src={s.logo_url || '/logo.png'} className="h-9 w-20 object-contain object-left"/><div className="hidden gap-3 text-[8px] font-bold uppercase md:flex"><span>Muebles</span><span>A medida</span><span>Materiales</span><span>Nosotros</span><span>Contacto</span></div></div>
      <section className="relative min-h-[270px] overflow-hidden bg-charcoal text-white"><img src={s.hero_image_url || '/logo.png'} className="absolute inset-0 h-full w-full object-cover opacity-55"/><div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent"/><div className="relative p-7"><p className="text-[8px] font-bold uppercase text-amber-200">Elite / Diseño de origen</p><h3 className="mt-3 font-display text-3xl leading-none">Diseño de origen<br/><em className="text-amber-100">{s.hero_title || 'Título del Hero'}</em></h3></div></section>
      <PreviewSection label="A medida" title={s.custom_title} text={s.custom_text} image={s.custom_image_url}/><PreviewSection label="Materiales" title={s.materials_title} text={s.materials_text} image={s.materials_image_url}/><PreviewSection label="Nosotros" title={s.about_title} text={s.about_text} image={s.about_image}/>
      <section className="bg-white p-6 text-center"><p className="text-[8px] font-bold uppercase text-stone">Contacto</p><h3 className="mt-2 font-display text-xl">{s.contact_title || 'Hablemos de tu espacio.'}</h3><p className="mt-2 text-[10px]">{s.phone}</p><p className="text-[10px]">{s.email}</p></section>
    </div></div><div className="border-t border-white/10 px-4 py-3 text-[10px] text-white/50">Se actualiza en tiempo real con cada cambio.</div>
  </aside>;
}

function PreviewSection({ label, title, text, image }: { label: string; title: string; text: string; image: string }) {
  return <section className="border-b bg-white p-6"><p className="text-[8px] font-bold uppercase text-stone">{label}</p><h3 className="mt-2 font-display text-xl">{title || 'Título de sección'}</h3><p className="mt-2 text-[10px] leading-5 text-stone">{text || 'Texto descriptivo de la sección.'}</p>{image && <img src={image} className="mt-4 aspect-[16/9] w-full rounded object-cover"/>}</section>;
}

export function AdminPanel({ navigate, categories, settings, onSettingsChange, onCategoryAdded }: Props) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [draft, setDraft] = useState<SiteSettings>(normalize(settings));
  const [files, setFiles] = useState<Partial<Record<keyof SiteSettings, File>>>({});
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => { setDraft(normalize(settings)); }, [settings]);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null)); }, []);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(normalize(settings)) || Object.keys(files).length > 0, [draft, settings, files]);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setDraft(d => ({ ...d, [key]: value }));

  const login = async (e: FormEvent) => { e.preventDefault(); setError(''); const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setError(error.message); else setUser(data.user); };
  const upload = async (file: File, prefix: string) => { const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'; const path = `${prefix}-${crypto.randomUUID()}.${ext}`; const { error } = await supabase.storage.from('product-images').upload(path, file); if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl; };

  const save = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      const next = { ...draft };
      for (const key of ['hero_image_url','about_image','custom_image_url','materials_image_url','logo_url','favicon_url'] as (keyof SiteSettings)[]) if (files[key]) next[key] = await upload(files[key]!, String(key).replace('_url',''));
      const { error } = await supabase.from('site_settings').update(next).eq('id', 1);
      if (error) throw error;
      setDraft(next); setFiles({}); onSettingsChange(next); setMessage('Cambios guardados y sincronizados.');
    } catch (e: any) { setError(e?.message || 'No se pudieron guardar los cambios.'); } finally { setSaving(false); }
  };

  const addCategory = async (e: FormEvent) => { e.preventDefault(); const name = newCategory.trim(); if (!name) return; const { error } = await supabase.from('categories').insert([{ name }]); if (error) setError(error.message); else { setNewCategory(''); onCategoryAdded(); setMessage('Categoría creada.'); } };

  if (!user) return <div className="min-h-screen bg-bone px-5 py-16"><form onSubmit={login} className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl"><button type="button" onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase text-stone"><ArrowLeft size={16}/> Sitio web</button><h1 className="font-display text-3xl">Panel Administrador</h1><p className="mt-2 text-sm text-stone">Editá el contenido y comprobá el resultado antes de guardar.</p>{error && <p className="mt-4 rounded bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="mt-6 space-y-4"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border p-3 text-sm"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded-lg border p-3 text-sm"/><button className="w-full rounded-lg bg-charcoal py-3 text-xs font-bold uppercase text-white">Iniciar sesión</button></div></form></div>;

  return <div className="min-h-screen bg-bone"><header className="border-b bg-white/90 px-5 py-3"><div className="mx-auto flex max-w-[1600px] items-center justify-between"><button onClick={()=>navigate('/')} className="flex items-center gap-2 text-xs font-bold uppercase text-stone"><ArrowLeft size={16}/> Sitio web</button><div className="flex items-center gap-4">{dirty && <span className="text-[10px] font-bold uppercase text-amber-700">Cambios sin guardar</span>}<button onClick={()=>supabase.auth.signOut().then(()=>setUser(null))} className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-600"><LogOut size={14}/> Salir</button></div></div></header>
    <div className="mx-auto grid max-w-[1600px] gap-6 p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_520px]">
      <div className="space-y-6"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-wood">CMS Visual</p><h1 className="mt-2 font-display text-4xl">Contenido y diseño</h1><p className="mt-2 max-w-2xl text-sm text-stone">Editá Home, A medida, Materiales, Nosotros y Contacto con preview en vivo. Los cambios no llegan a la base hasta pulsar Guardar.</p></div>
        {(message || error) && <div className={`rounded-xl p-4 text-sm ${error ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{error || message}</div>}
        <form onSubmit={save} className="space-y-6">
          <Card n="01" title="Marca"><div className="grid gap-6 lg:grid-cols-2"><div><h3 className="mb-3 text-sm font-bold">Logo</h3><ImageField name="logo_url" value={draft.logo_url} onChange={v=>set('logo_url',v)} file={files.logo_url} onFile={f=>setFiles(x=>({...x,logo_url:f}))}/></div><div><h3 className="mb-3 text-sm font-bold">Favicon</h3><ImageField name="favicon_url" value={draft.favicon_url} onChange={v=>set('favicon_url',v)} file={files.favicon_url} onFile={f=>setFiles(x=>({...x,favicon_url:f}))}/></div></div></Card>
          <Card n="02" title="Home / Hero"><div className="space-y-5"><Field label="Título principal" value={draft.hero_title} onChange={v=>set('hero_title',v)}/><ImageField name="hero_image_url" value={draft.hero_image_url} onChange={v=>set('hero_image_url',v)} file={files.hero_image_url} onFile={f=>setFiles(x=>({...x,hero_image_url:f}))}/></div></Card>
          <Card n="03" title="A medida"><div className="space-y-5"><Field label="Título" value={draft.custom_title} onChange={v=>set('custom_title',v)}/><Field label="Texto" multiline value={draft.custom_text} onChange={v=>set('custom_text',v)}/><ImageField name="custom_image_url" value={draft.custom_image_url} onChange={v=>set('custom_image_url',v)} file={files.custom_image_url} onFile={f=>setFiles(x=>({...x,custom_image_url:f}))}/></div></Card>
          <Card n="04" title="Materiales"><div className="space-y-5"><Field label="Título" value={draft.materials_title} onChange={v=>set('materials_title',v)}/><Field label="Texto" multiline value={draft.materials_text} onChange={v=>set('materials_text',v)}/><ImageField name="materials_image_url" value={draft.materials_image_url} onChange={v=>set('materials_image_url',v)} file={files.materials_image_url} onFile={f=>setFiles(x=>({...x,materials_image_url:f}))}/></div></Card>
          <Card n="05" title="Nosotros"><div className="space-y-5"><Field label="Título" value={draft.about_title} onChange={v=>set('about_title',v)}/><Field label="Texto" multiline value={draft.about_text} onChange={v=>set('about_text',v)}/><ImageField name="about_image" value={draft.about_image} onChange={v=>set('about_image',v)} file={files.about_image} onFile={f=>setFiles(x=>({...x,about_image:f}))}/></div></Card>
          <Card n="06" title="Contacto"><div className="grid gap-4 sm:grid-cols-2"><Field label="Título" value={draft.contact_title} onChange={v=>set('contact_title',v)}/><Field label="Teléfono" value={draft.phone} onChange={v=>set('phone',v)}/><Field label="Email" value={draft.email} onChange={v=>set('email',v)}/><Field label="WhatsApp (solo números)" value={draft.whatsapp} onChange={v=>set('whatsapp',v)}/></div></Card>
          <button disabled={saving} className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl disabled:opacity-60"><Save size={16}/>{saving ? 'Guardando…' : 'Guardar y sincronizar'}</button>
        </form>
        <Card n="07" title="Categorías"><div className="flex flex-wrap gap-2">{categories.map(c=><span key={c} className="rounded-full border bg-bone px-3 py-1.5 text-xs font-semibold">{c}</span>)}</div><form onSubmit={addCategory} className="mt-4 flex gap-2"><input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Nueva categoría" className="flex-1 rounded-lg border p-3 text-sm"/><button className="rounded-lg bg-charcoal px-5 text-xs font-bold uppercase text-white">Agregar</button></form></Card>
      </div>
      <Preview s={draft}/>
    </div>
  </div>;
}
