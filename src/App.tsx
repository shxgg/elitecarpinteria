import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  PenTool,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { materialSamples, products as initialProducts, quickCategories } from '@/data/products';
import { supabase } from './supabase';

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(['Amoblamientos de cocina', 'Revestimientos', 'Placards', 'Muebles a medida']);
  
  const [settings, setSettings] = useState({
    hero_title: 'Diseño de origen para espacios que viven con vos.',
    phone: '+54 11 2408-9472',
    email: 'matias@elitecarpinteria.com.ar',
    whatsapp: '5491124089472',
  });

  const WHATSAPP_URL = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`;
  const WHATSAPP_MESSAGE = 'Hola Elite, quisiera consultar por un mueble a medida.';
  const whatsappLink = (message = WHATSAPP_MESSAGE) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    async function fetchData() {
      // Productos de Supabase
      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData && prodData.length > 0) {
        const formatted = prodData.map((item: any) => ({
          id: item.id,
          name: item.title,
          description: item.description,
          category: item.category,
          kind: 'A medida',
          image: item.image_url,
          gallery: [item.image_url],
          details: item.description,
          referenceMeasures: 'A medida según espacio',
          material: 'Melamina / Aglomerado',
          colors: ['Blanco', 'Roble', 'Negro'],
          price: item.price || 0,
        }));
        setProducts(formatted);
      }

      // Categorías de Supabase
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData && catData.length > 0) {
        setCategories(catData.map((c: any) => c.name));
      }

      // Configuración del sitio
      const { data: setmData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (setmData) {
        setSettings({
          hero_title: setmData.hero_title || settings.hero_title,
          phone: setmData.phone || settings.phone,
          email: setmData.email || settings.email,
          whatsapp: setmData.whatsapp || settings.whatsapp,
        });
      }
    }
    fetchData();
  }, [route]);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/': 'Elite | Carpintería de Origen',
      '/muebles': 'Muebles a medida y en serie | Elite',
      '/a-medida': 'Muebles a medida | Elite Carpintería',
      '/materiales': 'Materiales | Elite Carpintería',
      '/nosotros': 'Nosotros | Elite Carpintería',
      '/contacto': 'Contacto | Elite Carpintería',
      '/admin': 'Panel de Administración | Elite',
    };
    const product = products.find((item) => `/muebles/${item.id}` === route);
    document.title = product ? `${product.name} | Elite Carpintería` : pageTitles[route] ?? pageTitles['/'];
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route, products]);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setRoute(path as Route);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-bone text-charcoal">
      {route !== '/admin' && <TopNotice />}
      {route !== '/admin' && <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} whatsappLink={whatsappLink} />}
      <main>
        {route === '/' && <Home navigate={navigate} products={products} settings={settings} whatsappLink={whatsappLink} />}
        {route === '/muebles' && <Catalog navigate={navigate} products={products} categories={categories} whatsappLink={whatsappLink} />}
        {route.startsWith('/muebles/') && <ProductDetail product={products.find((item) => `/muebles/${item.id}` === route) ?? products[0]} navigate={navigate} whatsappLink={whatsappLink} />}
        {route === '/a-medida' && <CustomMade whatsappLink={whatsappLink} />}
        {route === '/materiales' && <Materials />}
        {route === '/nosotros' && <About navigate={navigate} />}
        {route === '/contacto' && <Contact settings={settings} whatsappLink={whatsappLink} />}
        {route === '/admin' && <Admin navigate={navigate} categories={categories} onCategoryAdded={() => window.location.reload()} />}
      </main>
      {route !== '/admin' && <Footer navigate={navigate} settings={settings} />}
      {route !== '/admin' && <WhatsAppButton whatsappLink={whatsappLink} />}
    </div>
  );
}

type Route = '/' | '/muebles' | '/a-medida' | '/materiales' | '/nosotros' | '/contacto' | '/admin' | `/muebles/${string}`;

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/admin') return '/admin';
  if (path.startsWith('/muebles/')) return path as Route;
  if (['/', '/muebles', '/a-medida', '/materiales', '/nosotros', '/contacto', '/admin'].includes(path)) return path as Route;
  return '/';
}

function TopNotice() {
  return <div className="bg-charcoal px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75">Fabricación propia <span className="mx-2 text-wood">·</span> Muebles a medida <span className="mx-2 text-wood">·</span> Envíos a todo el país</div>;
}

type HeaderProps = { menuOpen: boolean; setMenuOpen: (value: boolean) => void; navigate: (path: string) => void; whatsappLink: () => string };
function Header({ menuOpen, setMenuOpen, navigate, whatsappLink }: HeaderProps) {
  const links = [['Muebles', '/muebles'], ['A medida', '/a-medida'], ['Materiales', '/materiales'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto']];
  return <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-bone/95 backdrop-blur-md">
    <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 lg:px-10">
      <button onClick={() => navigate('/')} className="group text-left" aria-label="Ir al inicio">
        <img src="/logo.png" alt="Elite | Carpintería de Origen" className="h-12 w-16 object-contain object-left" />
      </button>
      <nav className="hidden items-center gap-7 lg:flex">{links.map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal/65 transition-colors hover:text-wood">{label}</button>)}</nav>
      <div className="flex items-center gap-3"><a href={whatsappLink()} target="_blank" rel="noreferrer" className="hidden items-center gap-2 bg-wood px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-charcoal sm:flex">Pedir presupuesto <ArrowUpRight size={14} /></a><button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full border border-charcoal/15 p-2 lg:hidden" aria-label="Abrir menú">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
    </div>
    {menuOpen && <div className="border-t border-charcoal/10 bg-bone px-5 py-5 lg:hidden"><nav className="flex flex-col gap-5">{links.map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="text-left text-[11px] font-bold uppercase tracking-[0.16em]">{label}</button>)}<a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-wood"><MessageCircle size={16} /> Pedir presupuesto</a></nav></div>}
  </header>;
}

function Home({ navigate, products, settings, whatsappLink }: { navigate: (path: string) => void; products: any[]; settings: any; whatsappLink: (msg?: string) => string }) {
  return <>
    <section className="relative min-h-[680px] overflow-hidden bg-charcoal text-white lg:min-h-[calc(100vh-74px)]">
      <img src="/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg" alt="Mueble de living realizado por Elite Carpintería" className="absolute inset-0 h-full w-full object-cover opacity-75" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/55 to-charcoal/10" />
      <div className="relative mx-auto flex min-h-[680px] max-w-[1320px] items-end px-5 pb-20 pt-24 lg:min-h-[calc(100vh-74px)] lg:px-10 lg:pb-28"><div className="max-w-[720px] animate-rise"><p className="eyebrow text-wood-light">Elite <span className="mx-2 text-white/40">/</span> Diseño de origen</p><h1 className="mt-6 font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl lg:text-[7rem]">Diseño de origen<br /><em className="text-wood-light">{settings.hero_title}</em></h1><p className="mt-8 max-w-[430px] text-base leading-7 text-white/75">Diseñamos y fabricamos muebles en aglomerado y melamina para que tu casa tenga exactamente lo que necesitás.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={() => navigate('/muebles')} className="button-primary">Ver muebles <ArrowRight size={16} /></button><a href={whatsappLink()} target="_blank" rel="noreferrer" className="button-outline">Cotizá por WhatsApp <MessageCircle size={16} /></a></div></div></div>
      <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 lg:flex"><ArrowDown size={15} /> Bajá para conocer más</div>
    </section>
    <section className="bg-bone px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="01 / Para cada ambiente" title={<>Lo que imaginás,<br /><em>lo hacemos real.</em></>} copy="Muebles que resuelven tu espacio y también dicen algo de vos." /><div className="mt-12 grid gap-4 md:grid-cols-3">{quickCategories.map((category, index) => <button key={category.name} onClick={() => navigate('/muebles')} className="group relative min-h-[350px] overflow-hidden text-left text-white md:min-h-[450px]"><img src={category.image} alt={`Muebles de ${category.name.toLowerCase()}`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/10 to-transparent" /><div className="relative flex h-full flex-col justify-end p-6 lg:p-8"><span className="mb-auto text-[10px] font-bold tracking-[0.2em] text-white/60">0{index + 1}</span><h3 className="font-display text-3xl">{category.name}</h3><p className="mt-2 max-w-[260px] text-sm leading-6 text-white/70">{category.copy}</p><span className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-wood-light">Ver categoría <ArrowUpRight size={14} /></span></div></button>)}</div></div></section>
    <FeaturedProducts navigate={navigate} products={products} />
    <Process />
    <Benefits />
    <Testimonials />
    <FinalCta whatsappLink={whatsappLink} />
  </>;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: React.ReactNode; copy?: string }) {
  return <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-4">{title}</h2></div>{copy && <p className="max-w-[320px] text-sm leading-6 text-stone">{copy}</p>}</div>;
}

function FeaturedProducts({ navigate, products }: { navigate: (path: string) => void; products: any[] }) {
  return <section className="bg-white px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="02 / Muebles destacados" title={<>Diseñados para <em>quedarse.</em></>} copy="Algunos modelos para inspirarte. Todo se puede adaptar a tus medidas y necesidades." /><div className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}</div><div className="mt-14 text-center"><button onClick={() => navigate('/muebles')} className="button-dark">Ver todos los muebles <ArrowRight size={16} /></button></div></div></section>;
}

function ProductCard({ product, navigate }: { product: any; navigate: (path: string) => void }) {
  const formattedPrice = product.price && product.price > 0 
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)
    : 'A consultar';

  return <article className="group"><button onClick={() => navigate(`/muebles/${product.id}`)} className="block w-full text-left"><div className="relative aspect-[.88] overflow-hidden bg-stone-light"><img src={product.image} alt={`${product.name}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><span className="absolute left-3 top-3 bg-bone/90 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-charcoal">{product.kind}</span><span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white text-charcoal opacity-0 transition-all group-hover:opacity-100"><ArrowUpRight size={16} /></span></div><div className="pt-4"><div className="flex justify-between items-center"><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-wood">{product.category}</p><span className="text-xs font-bold text-charcoal">{formattedPrice}</span></div><h3 className="mt-2 font-display text-2xl">{product.name}</h3><p className="mt-2 text-sm leading-6 text-stone">{product.description}</p><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-charcoal">Ver detalle <ArrowUpRight size={14} /></span></div></button></article>;
}

function Process() {
  const steps = [['01', 'Consulta', 'Nos contás qué necesitás, dónde va y cómo te gustaría que se sienta.'], ['02', 'Diseño y medidas', 'Pensamos la distribución y definimos medidas, material, color y detalles.'], ['03', 'Fabricación', 'Cortamos, canteamos y armamos en nuestro taller con atención en cada terminación.'], ['04', 'Entrega e instalación', 'Coordinamos la entrega y dejamos tu mueble listo para usar.']];
  return <section className="bg-bone px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="03 / Cómo trabajamos" title={<>De la idea a tu casa, <em>sin vueltas.</em></>} /><div className="mt-14 grid gap-0 border-t border-charcoal/15 md:grid-cols-4">{steps.map(([number, title, copy]) => <div key={number} className="border-b border-charcoal/15 py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><span className="font-display text-3xl text-wood">{number}</span><h3 className="mt-7 font-display text-2xl">{title}</h3><p className="mt-3 text-sm leading-6 text-stone">{copy}</p></div>)}</div></div></section>;
}

function Benefits() {
  const benefits = [[PenTool, 'Fabricación propia', 'Lo hacemos en nuestro taller, de principio a fin.'], [Ruler, 'A medida o en serie', 'Una pieza única o un modelo repetible, según tu proyecto.'], [Truck, 'Envíos a todo el país', 'Coordinamos la logística para que llegue a donde estés.'], [Sparkles, 'Atención personalizada', 'Te acompañamos para tomar buenas decisiones.']];
  return <section className="border-y border-charcoal/10 bg-white px-5 py-16 lg:px-10"><div className="mx-auto grid max-w-[1320px] gap-9 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(([Icon, title, copy]) => <div key={title as string} className="flex gap-4"><Icon size={22} strokeWidth={1.4} className="shrink-0 text-wood" /><div><h3 className="text-sm font-bold">{title as string}</h3><p className="mt-2 text-xs leading-5 text-stone">{copy as string}</p></div></div>)}</div></section>;
}

function Testimonials() {
  const testimonials = [['“Nos ayudaron a ordenar una cocina complicada y el resultado quedó impecable. Se nota el cuidado en cada detalle.”', 'Lucía M. · Colegiales'], ['“Pedimos un placard con medidas muy específicas y cumplieron con los tiempos y la instalación.”', 'Tomás R. · Vicente López'], ['“El escritorio quedó hermoso y mucho más sólido de lo que esperábamos. La atención fue muy clara.”', 'Sofía G. · La Plata']];
  return <section className="bg-bone px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="04 / Lo que dicen" title={<>Hecho para la vida <em>real.</em></>} copy="Testimonios de ejemplo para reemplazar con las historias de tus clientes." /><div className="mt-12 grid gap-5 md:grid-cols-3">{testimonials.map(([quote, author]) => <blockquote key={author} className="border border-charcoal/12 bg-white p-7"><span className="font-display text-4xl text-wood">“</span><p className="mt-2 font-display text-xl leading-8">{quote.replace(/[“”]/g, '')}</p><footer className="mt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-stone">{author}</footer></blockquote>)}</div></div></section>;
}

function FinalCta({ whatsappLink }: { whatsappLink: (msg?: string) => string }) {
  return <section className="bg-wood px-5 py-20 text-white lg:px-10 lg:py-24"><div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="eyebrow text-white/70">Tu próximo mueble</p><h2 className="mt-4 font-display text-4xl tracking-[-.03em] sm:text-6xl">Contanos qué necesitás.</h2></div><a href={whatsappLink()} target="_blank" rel="noreferrer" className="button-light">Hablar por WhatsApp <MessageCircle size={17} /></a></div></section>;
}

function Catalog({ navigate, products, categories, whatsappLink }: { navigate: (path: string) => void; products: any[]; categories: string[]; whatsappLink: (msg?: string) => string }) {
  const [filter, setFilter] = useState<string>('Todos');
  const filtered = useMemo(() => filter === 'Todos' ? products : products.filter((product) => product.category === filter), [filter, products]);
  return <PageIntro eyebrow="Colección Elite" title={<>Muebles que se adaptan<br /><em>a tu manera de vivir.</em></>} copy="Explorá nuestros modelos de referencia. Cada producto puede personalizarse en medidas, color y distribución." pageClass="bg-white"><div className="mx-auto max-w-[1320px] px-5 pb-24 lg:px-10"><div className="flex gap-2 overflow-x-auto border-b border-charcoal/15 pb-3">{['Todos', ...categories].map((category) => <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] ${filter === category ? 'border-b-2 border-wood text-wood' : 'text-stone hover:text-charcoal'}`}>{category}</button>)}</div><div className="mt-10 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}</div></div></PageIntro>;
}

function PageIntro({ eyebrow, title, copy, children, pageClass = 'bg-bone' }: { eyebrow: string; title: React.ReactNode; copy: string; children: React.ReactNode; pageClass?: string }) {
  return <div className={pageClass}><section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28"><div className="mx-auto max-w-[1320px]"><p className="eyebrow">{eyebrow}</p><h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-[500px] text-base leading-7 text-stone">{copy}</p></div></section>{children}</div>;
}

function ProductDetail({ product, navigate, whatsappLink }: { product: any; navigate: (path: string) => void; whatsappLink: (msg?: string) => string }) {
  const formattedPrice = product.price && product.price > 0 
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)
    : 'Precio a consultar';

  return <div className="bg-bone"><section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-20 lg:px-10 lg:py-20"><div className="grid grid-cols-2 gap-3"><div className="col-span-2 aspect-[1.4] overflow-hidden bg-stone-light"><img src={product.gallery?.[0] || product.image} alt={product.name} className="h-full w-full object-cover" /></div></div><div className="self-center"><button onClick={() => navigate('/muebles')} className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone hover:text-wood"><ArrowLeft size={14} /> Volver a muebles</button><p className="eyebrow">{product.category}</p><h1 className="mt-4 font-display text-5xl leading-none tracking-[-.04em] sm:text-6xl">{product.name}</h1><div className="mt-4 flex items-center gap-4"><span className="inline-block border border-wood px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-wood">{product.kind}</span><span className="text-2xl font-bold text-charcoal">{formattedPrice}</span></div><p className="mt-8 text-base leading-7 text-stone">{product.details}</p><div className="mt-10 grid gap-5 border-y border-charcoal/15 py-6 text-sm sm:grid-cols-2"><div><p className="detail-label">Medidas de referencia</p><p className="mt-2">{product.referenceMeasures}</p></div><div><p className="detail-label">Material</p><p className="mt-2">{product.material}</p></div></div><a href={whatsappLink(`Hola Elite, quisiera consultar por ${product.name} (${formattedPrice}).`)} target="_blank" rel="noreferrer" className="button-dark mt-9 w-full justify-center">Consultar por WhatsApp <MessageCircle size={16} /></a></div></section></div>;
}

function QuoteForm({ whatsappLink }: { whatsappLink: (msg?: string) => string }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = `Hola Elite, soy ${data.get('name')}.\nTeléfono: ${data.get('phone')}\nEmail: ${data.get('email')}\nTipo de mueble: ${data.get('furniture')}\nMedidas aproximadas: ${data.get('measures')}\nMaterial o color: ${data.get('material')}\nZona de entrega: ${data.get('zone')}\nComentarios: ${data.get('comments')}`;
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
    setSent(true);
  }
  if (sent) return <div className="flex min-h-[430px] flex-col items-center justify-center bg-white p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-wood text-white"><Check size={25} /></span><h2 className="mt-6 font-display text-3xl">Consulta lista.</h2><p className="mt-3 max-w-[300px] text-sm leading-6 text-stone">Se abrió WhatsApp con todos los datos ordenados para que podamos responderte.</p></div>;
  return <form onSubmit={submit} className="grid gap-6 bg-white p-6 sm:grid-cols-2 sm:p-10"><Field label="Nombre" name="name" placeholder="Tu nombre" required /><Field label="Teléfono" name="phone" placeholder="11 2408-9472" required /><Field label="Email" name="email" type="email" placeholder="tu@email.com" required /><Field label="Tipo de mueble" name="furniture" as="select" options={['Cocina', 'Placard o vestidor', 'Living', 'Escritorio', 'Baño', 'Otro']} required /><Field label="Medidas aproximadas" name="measures" placeholder="Ancho x alto x profundidad" /><Field label="Material o color preferido" name="material" placeholder="Ej. Roble, blanco, verde oliva" /><Field label="Zona de entrega" name="zone" placeholder="Localidad / provincia" required /><Field label="Comentarios" name="comments" placeholder="Contanos un poco más" as="textarea" /><button type="submit" className="button-dark sm:col-span-2 sm:justify-center">Enviar por WhatsApp <MessageCircle size={16} /></button><p className="text-center text-[10px] text-stone sm:col-span-2">Las medidas finales se confirman en una visita o con un relevamiento previo.</p></form>;
}

type FieldProps = { label: string; name: string; placeholder?: string; type?: string; as?: 'input' | 'select' | 'textarea'; options?: string[]; required?: boolean };
function Field({ label, name, placeholder, type = 'text', as = 'input', options = [], required = false }: FieldProps) {
  return <label className="field"><span>{label}</span>{as === 'select' ? <select name={name} defaultValue="" required={required}><option value="" disabled>Seleccioná una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : as === 'textarea' ? <textarea name={name} placeholder={placeholder} rows={4} required={required} /> : <input name={name} type={type} placeholder={placeholder} required={required} />}</label>;
}

function CustomMade({ whatsappLink }: { whatsappLink: (msg?: string) => string }) {
  return <PageIntro eyebrow="El servicio" title={<>Un mueble a medida<br /><em>empieza por escucharte.</em></>} copy="Diseñamos cada pieza alrededor de tu espacio, tus hábitos y tu forma de usarlo." pageClass="bg-bone"><section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24"><div><p className="eyebrow">Diseño que resuelve</p><h2 className="mt-4 font-display text-4xl leading-tight">La medida justa no es solo un número.</h2><p className="mt-6 text-sm leading-7 text-stone">Es entender cómo circulás, qué querés guardar, dónde necesitás apoyo y qué querés ver cuando entrás a tu casa.</p></div><QuoteForm whatsappLink={whatsappLink} /></section></PageIntro>;
}

function Materials() {
  return <PageIntro eyebrow="Materiales honestos" title={<>Simple de elegir,<br /><em>fácil de cuidar.</em></>} copy="Trabajamos principalmente con aglomerado y melamina." pageClass="bg-white"><div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-2"><div><h2 className="font-display text-4xl">Aglomerado y melamina</h2><p className="mt-6 text-sm leading-7 text-stone">El aglomerado es un tablero formado por partículas de madera prensadas con recubrimiento de melamina.</p></div><div className="bg-bone p-7 sm:p-10"><p className="eyebrow">Muestrario</p><div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-3">{materialSamples.map((sample) => <div key={sample.name}><div className="aspect-square border border-charcoal/10" style={{ backgroundColor: sample.value }} /><p className="mt-2 text-[10px] font-semibold leading-4 text-stone">{sample.name}</p></div>)}</div></div></div></div></PageIntro>;
}

function About({ navigate }: { navigate: (path: string) => void }) {
  return <PageIntro eyebrow="Nosotros" title={<>Un taller con los pies<br /><em>en el origen.</em></>} copy="Elite nace de hacer muebles honestos y bien pensados." pageClass="bg-bone"><section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24"><div className="aspect-[.95] overflow-hidden"><img src="https://images.pexels.com/photos/7484794/pexels-photo-7484794.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Taller" className="h-full w-full object-cover" loading="lazy" /></div><div><h2 className="font-display text-4xl leading-tight">Oficio y compromiso.</h2><p className="mt-7 text-sm leading-7 text-stone">Somos una carpintería argentina que trabaja con aglomerado y melamina.</p><button onClick={() => navigate('/a-medida')} className="button-dark mt-8">Hablemos de tu proyecto <ArrowRight size={16} /></button></div></section></PageIntro>;
}

function Contact({ settings, whatsappLink }: { settings: any; whatsappLink: (msg?: string) => string }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const message = `Hola Elite, soy ${data.get('name')}.\nMi consulta: ${data.get('message')}`; window.open(whatsappLink(message), '_blank', 'noopener,noreferrer'); setSent(true); }
  return <PageIntro eyebrow="Contacto" title={<>Hablemos de<br /><em>tu espacio.</em></>} copy="Buenos Aires, Argentina." pageClass="bg-white"><section className="mx-auto grid max-w-[1320px] gap-14 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-24"><div><div className="space-y-6"><a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-start gap-4"><MessageCircle className="mt-1 text-wood" size={21} /><span><strong className="block text-sm">WhatsApp</strong><span className="mt-1 block text-sm text-stone">{settings.phone}</span></span></a></div></div><form onSubmit={submit} className="grid gap-6 bg-bone p-6 sm:p-10"><Field label="Nombre" name="name" placeholder="Tu nombre" required /><Field label="Mensaje" name="message" placeholder="Mensaje..." as="textarea" required /><button type="submit" className="button-dark sm:justify-center">{sent ? '¡Enviado!' : 'Enviar'} <MessageCircle size={16} /></button></form></section></PageIntro>;
}

function Footer({ navigate, settings }: { navigate: (path: string) => void; settings: any }) {
  return <footer className="border-t border-charcoal/10 bg-charcoal px-5 py-16 text-white/70 lg:px-10"><div className="mx-auto max-w-[1320px] text-center text-xs text-white/50">{settings.phone} · {settings.email}</div></footer>;
}

function WhatsAppButton({ whatsappLink }: { whatsappLink: (msg?: string) => string }) {
  return <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"><MessageCircle size={26} /></a>;
}

// ----------------------------------------------------
// PANEL DE ADMINISTRACIÓN CON PREVISUALIZACIÓN EN VIVO
// ----------------------------------------------------
function Admin({ navigate, categories, onCategoryAdded }: { navigate: (path: string) => void; categories: string[]; onCategoryAdded: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Formulario Mueble (con estados para la previsualización en vivo)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Amoblamientos de cocina');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  // Nueva Categoría
  const [newCatName, setNewCatName] = useState('');

  // Configuración General del Sitio
  const [heroTitle, setHeroTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const loadData = async () => {
    const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodData) setDbProducts(prodData);

    const { data: setmData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (setmData) {
      setHeroTitle(setmData.hero_title || '');
      setPhone(setmData.phone || '');
      setSiteEmail(setmData.email || '');
      setWhatsapp(setmData.whatsapp || '');
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Manejar cambio de archivo para la foto de previsualización
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Error: ' + error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName.trim() }]);
    if (error) alert('Error al crear categoría: ' + error.message);
    else {
      alert('¡Categoría creada con éxito!');
      setNewCatName('');
      onCategoryAdded();
    }
  };

  const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Por favor seleccioná una imagen');

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
    if (uploadError) {
      alert('Error subiendo foto: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

    const { error: insertError } = await supabase.from('products').insert([
      { 
        title, 
        description, 
        price: price ? parseFloat(price) : 0, 
        category, 
        image_url: urlData.publicUrl 
      },
    ]);

    if (insertError) alert('Error guardando producto: ' + insertError.message);
    else {
      alert('¡Producto cargado exitosamente!');
      setTitle('');
      setDescription('');
      setPrice('');
      setFile(null);
      setPreviewUrl('');
      loadData();
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este mueble?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else loadData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('site_settings').update({
      hero_title: heroTitle,
      phone,
      email: siteEmail,
      whatsapp,
    }).eq('id', 1);

    if (error) alert('Error guardando configuración: ' + error.message);
    else alert('¡Configuración actualizada!');
    setLoading(false);
  };

  // Precio formateado para la previsualización
  const previewPriceFormatted = price && !isNaN(Number(price)) && Number(price) > 0
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(price))
    : 'A consultar';

  return (
    <div className="min-h-screen bg-bone p-6">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone hover:text-wood">
          <ArrowLeft size={16} /> Volver al sitio web
        </button>

        {!user ? (
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md space-y-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">Panel Administrador</h2>
            <p className="text-sm text-stone mb-4">Iniciá sesión para gestionar tu sitio.</p>
            <input type="email" placeholder="Email" className="w-full border p-3 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="w-full border p-3 rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full bg-charcoal text-white py-3 rounded font-bold uppercase tracking-wider text-xs">
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* GESTIÓN DE CATEGORÍAS */}
            <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
              <h2 className="text-xl font-bold border-b pb-3">Gestionar Categorías Dinámicas</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <span key={cat} className="bg-bone border px-3 py-1.5 text-xs font-semibold rounded">{cat}</span>
                ))}
              </div>
              <form onSubmit={handleAddCategory} className="flex gap-3">
                <input type="text" placeholder="Nueva categoría (ej. Vestidores)" className="flex-1 border p-3 rounded text-sm" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
                <button type="submit" className="bg-charcoal text-white px-5 py-3 rounded text-xs font-bold uppercase">Agregar Categoría</button>
              </form>
            </div>

            {/* SECCIÓN PRINCIPAL: FORMULARIO DE CARGA + PREVISUALIZACIÓN EN VIVO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Formulario */}
              <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-bold">Cargar Nuevo Mueble</h2>
                  <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="text-xs text-red-600 font-bold uppercase">Cerrar Sesión</button>
                </div>
                <form onSubmit={handleUploadProduct} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Título del mueble</label>
                    <input type="text" placeholder="Ej. Cocina Minimalista Roble" className="w-full border p-3 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Precio ($ ARS)</label>
                      <input type="number" placeholder="Ej: 250000" className="w-full border p-3 rounded" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Categoría</label>
                      <select className="w-full border p-3 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Descripción</label>
                    <textarea placeholder="Descripción detallada..." className="w-full border p-3 rounded" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Foto del Mueble</label>
                    <input type="file" accept="image/*" className="w-full border p-3 rounded bg-bone text-xs" onChange={handleFileChange} required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-wood text-white py-3 rounded font-bold uppercase tracking-wider text-xs hover:bg-charcoal transition-colors">
                    {loading ? 'Subiendo y guardando...' : 'Guardar en Supabase'}
                  </button>
                </form>
              </div>

              {/* Previsualización en Vivo */}
              <div className="bg-white p-8 rounded-lg shadow-md space-y-4 sticky top-6">
                <div className="border-b pb-3">
                  <span className="bg-wood text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">Live Preview</span>
                  <h3 className="text-xl font-bold mt-2">Así se verá en la web</h3>
                </div>
                <div className="border border-charcoal/10 rounded overflow-hidden bg-bone/50 p-4">
                  <div className="relative aspect-[1.1] overflow-hidden bg-stone-light rounded">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Previsualización" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-stone uppercase tracking-wider font-semibold">Seleccioná una foto para previsualizar</div>
                    )}
                    <span className="absolute left-3 top-3 bg-bone/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-charcoal">A medida</span>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-wood">{category || 'Categoría'}</p>
                      <span className="text-xs font-bold text-charcoal">{previewPriceFormatted}</span>
                    </div>
                    <h4 className="mt-1 font-display text-2xl">{title || 'Título del mueble'}</h4>
                    <p className="mt-2 text-xs leading-5 text-stone line-clamp-2">{description || 'La descripción detallada del mueble aparecerá aquí...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONFIGURACIÓN DEL SITIO */}
            <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
              <h2 className="text-xl font-bold border-b pb-3">Editar Textos y Contacto del Sitio</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Título principal (Hero de la Home)</label>
                  <input type="text" className="w-full border p-3 rounded text-sm" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Teléfono visible</label>
                    <input type="text" className="w-full border p-3 rounded text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">WhatsApp (ej: 5491124089472)</label>
                    <input type="text" className="w-full border p-3 rounded text-sm" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-charcoal text-white py-3 rounded font-bold uppercase tracking-wider text-xs">Guardar Cambios del Sitio</button>
              </form>
            </div>

            {/* TABLA DE MUEBLES CARGADOS */}
            <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
              <h3 className="text-xl font-bold border-b pb-3">Muebles Cargados ({dbProducts.length})</h3>
              {dbProducts.length === 0 ? (
                <p className="text-sm text-stone py-4 text-center">Aún no hay muebles cargados.</p>
              ) : (
                <div className="divide-y">
                  {dbProducts.map((prod) => (
                    <div key={prod.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={prod.image_url} alt={prod.title} className="w-16 h-16 object-cover rounded border" />
                        <div>
                          <h4 className="font-bold text-sm">{prod.title}</h4>
                          <span className="text-xs text-wood font-semibold uppercase">{prod.category}</span>
                          <p className="text-xs font-bold text-charcoal mt-0.5">{prod.price > 0 ? `$ ${prod.price.toLocaleString('es-AR')}` : 'A consultar'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded font-bold hover:bg-red-200 transition-colors">Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}