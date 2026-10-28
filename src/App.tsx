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
import { materialSamples, products, productCategories, Product, ProductCategory, quickCategories } from '@/data/products';

const WHATSAPP_URL = 'https://wa.me/5491124089472';
const WHATSAPP_MESSAGE = 'Hola Elite, quisiera consultar por un mueble a medida.';
const whatsappLink = (message = WHATSAPP_MESSAGE) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

type Route = '/' | '/muebles' | '/a-medida' | '/materiales' | '/nosotros' | '/contacto' | `/muebles/${string}`;

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path.startsWith('/muebles/') && products.some((product) => `/muebles/${product.id}` === path)) return path as Route;
  if (['/', '/muebles', '/a-medida', '/materiales', '/nosotros', '/contacto'].includes(path)) return path as Route;
  return '/';
}

function App() {
  const [route, setRoute] = useState<Route>(getRoute);
  const [menuOpen, setMenuOpen] = useState(false);

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
    };
    const product = products.find((item) => `/muebles/${item.id}` === route);
    document.title = product ? `${product.name} | Elite Carpintería` : pageTitles[route] ?? pageTitles['/'];
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Muebles a medida y en serie en aglomerado y melamina. Diseño, fabricación propia y envíos a todo el país.');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route]);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setRoute(path as Route);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-bone text-charcoal">
      <TopNotice />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
      <main>
        {route === '/' && <Home navigate={navigate} />}
        {route === '/muebles' && <Catalog navigate={navigate} />}
        {route.startsWith('/muebles/') && <ProductDetail product={products.find((item) => `/muebles/${item.id}` === route) ?? products[0]} navigate={navigate} />}
        {route === '/a-medida' && <CustomMade />}
        {route === '/materiales' && <Materials />}
        {route === '/nosotros' && <About navigate={navigate} />}
        {route === '/contacto' && <Contact />}
      </main>
      <Footer navigate={navigate} />
      <WhatsAppButton />
    </div>
  );
}

function TopNotice() {
  return <div className="bg-charcoal px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75">Fabricación propia <span className="mx-2 text-wood">·</span> Muebles a medida <span className="mx-2 text-wood">·</span> Envíos a todo el país</div>;
}

type HeaderProps = { menuOpen: boolean; setMenuOpen: (value: boolean) => void; navigate: (path: string) => void };
function Header({ menuOpen, setMenuOpen, navigate }: HeaderProps) {
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

function Home({ navigate }: { navigate: (path: string) => void }) {
  return <>
    <section className="relative min-h-[680px] overflow-hidden bg-charcoal text-white lg:min-h-[calc(100vh-74px)]">
      <img src="/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg" alt="Mueble de living realizado por Elite Carpintería" className="absolute inset-0 h-full w-full object-cover opacity-75" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/55 to-charcoal/10" />
      <div className="relative mx-auto flex min-h-[680px] max-w-[1320px] items-end px-5 pb-20 pt-24 lg:min-h-[calc(100vh-74px)] lg:px-10 lg:pb-28"><div className="max-w-[720px] animate-rise"><p className="eyebrow text-wood-light">Elite <span className="mx-2 text-white/40">/</span> Diseño de origen</p><h1 className="mt-6 font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl lg:text-[7rem]">Diseño de origen<br /><em className="text-wood-light">para espacios que viven con vos.</em></h1><p className="mt-8 max-w-[430px] text-base leading-7 text-white/75">Diseñamos y fabricamos muebles en aglomerado y melamina para que tu casa tenga exactamente lo que necesitás.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={() => navigate('/muebles')} className="button-primary">Ver muebles <ArrowRight size={16} /></button><a href={whatsappLink()} target="_blank" rel="noreferrer" className="button-outline">Cotizá por WhatsApp <MessageCircle size={16} /></a></div></div></div>
      <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 lg:flex"><ArrowDown size={15} /> Bajá para conocer más</div>
    </section>
    <section className="bg-bone px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="01 / Para cada ambiente" title={<>Lo que imaginás,<br /><em>lo hacemos real.</em></>} copy="Muebles que resuelven tu espacio y también dicen algo de vos." /><div className="mt-12 grid gap-4 md:grid-cols-3">{quickCategories.map((category, index) => <button key={category.name} onClick={() => navigate('/muebles')} className="group relative min-h-[350px] overflow-hidden text-left text-white md:min-h-[450px]"><img src={category.image} alt={`Muebles de ${category.name.toLowerCase()}`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/10 to-transparent" /><div className="relative flex h-full flex-col justify-end p-6 lg:p-8"><span className="mb-auto text-[10px] font-bold tracking-[0.2em] text-white/60">0{index + 1}</span><h3 className="font-display text-3xl">{category.name}</h3><p className="mt-2 max-w-[260px] text-sm leading-6 text-white/70">{category.copy}</p><span className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-wood-light">Ver categoría <ArrowUpRight size={14} /></span></div></button>)}</div></div></section>
    <section className="bg-charcoal px-5 py-20 text-white lg:px-10 lg:py-28"><div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><p className="eyebrow text-wood-light">La diferencia está en el proceso</p><div><h2 className="font-display text-4xl leading-tight tracking-[-.03em] sm:text-6xl">Hacemos muebles pensados para tu casa, <em className="text-wood-light">pero más para vos.</em></h2><p className="mt-7 max-w-[620px] text-sm leading-7 text-white/65">Fabricamos desde cero, tomamos medidas exactas y cuidamos cada terminación. Porque un mueble puede llenar un espacio, pero uno bien pensado transforma la forma de habitarlo.</p></div></div></section>
    <FeaturedProducts navigate={navigate} />
    <Process />
    <Benefits />
    <Testimonials />
    <FinalCta />
  </>;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: React.ReactNode; copy?: string }) {
  return <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-4">{title}</h2></div>{copy && <p className="max-w-[320px] text-sm leading-6 text-stone">{copy}</p>}</div>;
}

function FeaturedProducts({ navigate }: { navigate: (path: string) => void }) {
  return <section className="bg-white px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="02 / Muebles destacados" title={<>Diseñados para <em>quedarse.</em></>} copy="Algunos modelos para inspirarte. Todo se puede adaptar a tus medidas y necesidades." /><div className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}</div><div className="mt-14 text-center"><button onClick={() => navigate('/muebles')} className="button-dark">Ver todos los muebles <ArrowRight size={16} /></button></div></div></section>;
}

function ProductCard({ product, navigate }: { product: Product; navigate: (path: string) => void }) {
  return <article className="group"><button onClick={() => navigate(`/muebles/${product.id}`)} className="block w-full text-left"><div className="relative aspect-[.88] overflow-hidden bg-stone-light"><img src={product.image} alt={`${product.name}, mueble de ${product.category.toLowerCase()}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><span className="absolute left-3 top-3 bg-bone/90 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-charcoal">{product.kind}</span><span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white text-charcoal opacity-0 transition-all group-hover:opacity-100"><ArrowUpRight size={16} /></span></div><div className="pt-4"><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-wood">{product.category}</p><h3 className="mt-2 font-display text-2xl">{product.name}</h3><p className="mt-2 text-sm leading-6 text-stone">{product.description}</p><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-charcoal">Consultar precio <ArrowUpRight size={14} /></span></div></button></article>;
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

function FinalCta() {
  return <section className="bg-wood px-5 py-20 text-white lg:px-10 lg:py-24"><div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="eyebrow text-white/70">Tu próximo mueble</p><h2 className="mt-4 font-display text-4xl tracking-[-.03em] sm:text-6xl">Contanos qué necesitás.</h2></div><a href={whatsappLink()} target="_blank" rel="noreferrer" className="button-light">Hablar por WhatsApp <MessageCircle size={17} /></a></div></section>;
}

function Catalog({ navigate }: { navigate: (path: string) => void }) {
  const [filter, setFilter] = useState<'Todos' | ProductCategory>('Todos');
  const filtered = useMemo(() => filter === 'Todos' ? products : products.filter((product) => product.category === filter), [filter]);
  return <PageIntro eyebrow="Colección Elite" title={<>Muebles que se adaptan<br /><em>a tu manera de vivir.</em></>} copy="Explorá nuestros modelos de referencia. Cada producto puede personalizarse en medidas, color y distribución." pageClass="bg-white"><div className="mx-auto max-w-[1320px] px-5 pb-24 lg:px-10"><div className="flex gap-2 overflow-x-auto border-b border-charcoal/15 pb-3">{['Todos', ...productCategories].map((category) => <button key={category} onClick={() => setFilter(category as 'Todos' | ProductCategory)} className={`whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] ${filter === category ? 'border-b-2 border-wood text-wood' : 'text-stone hover:text-charcoal'}`}>{category}</button>)}</div><div className="mt-10 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} />)}</div></div></PageIntro>;
}

function PageIntro({ eyebrow, title, copy, children, pageClass = 'bg-bone' }: { eyebrow: string; title: React.ReactNode; copy: string; children: React.ReactNode; pageClass?: string }) {
  return <div className={pageClass}><section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28"><div className="mx-auto max-w-[1320px]"><p className="eyebrow">{eyebrow}</p><h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-[500px] text-base leading-7 text-stone">{copy}</p></div></section>{children}</div>;
}

function ProductDetail({ product, navigate }: { product: Product; navigate: (path: string) => void }) {
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  return <div className="bg-bone"><section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-20 lg:px-10 lg:py-20"><div className="grid grid-cols-2 gap-3"><div className="col-span-2 aspect-[1.4] overflow-hidden bg-stone-light"><img src={product.gallery[0]} alt={`${product.name}, vista principal`} className="h-full w-full object-cover" /></div>{product.gallery.slice(1).map((imageUrl) => <div key={imageUrl} className="aspect-[1.2] overflow-hidden bg-stone-light"><img src={imageUrl} alt={`${product.name}, detalle`} className="h-full w-full object-cover" loading="lazy" /></div>)}</div><div className="self-center"><button onClick={() => navigate('/muebles')} className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone hover:text-wood"><ArrowLeft size={14} /> Volver a muebles</button><p className="eyebrow">{product.category}</p><h1 className="mt-4 font-display text-5xl leading-none tracking-[-.04em] sm:text-6xl">{product.name}</h1><span className="mt-5 inline-block border border-wood px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-wood">{product.kind}</span><p className="mt-8 text-base leading-7 text-stone">{product.details}</p><div className="mt-10 grid gap-5 border-y border-charcoal/15 py-6 text-sm sm:grid-cols-2"><div><p className="detail-label">Medidas de referencia</p><p className="mt-2">{product.referenceMeasures}</p></div><div><p className="detail-label">Material</p><p className="mt-2">{product.material}</p></div></div><div className="mt-7"><p className="detail-label">Colores disponibles</p><div className="mt-3 flex flex-wrap gap-2">{product.colors.map((color, index) => <span key={color} className="flex items-center gap-2 border border-charcoal/15 px-3 py-2 text-xs"><i className="h-3 w-3 rounded-full border border-charcoal/15" style={{ backgroundColor: materialSamples[index % materialSamples.length].value }} />{color}</span>)}</div></div><a href={whatsappLink(`Hola Elite, quisiera consultar por ${product.name}.`)} target="_blank" rel="noreferrer" className="button-dark mt-9 w-full justify-center">Consultar por WhatsApp <MessageCircle size={16} /></a><p className="mt-3 text-center text-[10px] text-stone">No publicamos precios porque cada proyecto se cotiza según medidas y terminaciones.</p></div></section>{related.length > 0 && <section className="border-t border-charcoal/10 bg-white px-5 py-20 lg:px-10"><div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="También puede interesarte" title={<>Más ideas para tu <em>espacio.</em></>} /><div className="mt-10 grid gap-6 sm:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} navigate={navigate} />)}</div></div></section>}</div>;
}

function QuoteForm() {
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

function CustomMade() {
  return <PageIntro eyebrow="El servicio" title={<>Un mueble a medida<br /><em>empieza por escucharte.</em></>} copy="Diseñamos cada pieza alrededor de tu espacio, tus hábitos y tu forma de usarlo." pageClass="bg-bone"><section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24"><div><p className="eyebrow">Diseño que resuelve</p><h2 className="mt-4 font-display text-4xl leading-tight">La medida justa no es solo un número.</h2><p className="mt-6 text-sm leading-7 text-stone">Es entender cómo circulás, qué querés guardar, dónde necesitás apoyo y qué querés ver cuando entrás a tu casa. Por eso trabajamos con una mirada completa, desde el primer mensaje hasta la instalación.</p><div className="mt-10 space-y-5 border-t border-charcoal/15 pt-7"><p className="flex gap-3 text-sm"><Check size={17} className="shrink-0 text-wood" /> Relevamiento y definición de medidas</p><p className="flex gap-3 text-sm"><Check size={17} className="shrink-0 text-wood" /> Elección de colores, texturas y herrajes</p><p className="flex gap-3 text-sm"><Check size={17} className="shrink-0 text-wood" /> Fabricación e instalación coordinada</p></div></div><QuoteForm /></section></PageIntro>;
}

function Materials() {
  const [open, setOpen] = useState(0);
  const faqs = [['¿Cuánto tardan?', 'El tiempo depende del tipo de mueble, la cantidad de piezas y la agenda de fabricación. Te damos un plazo estimado antes de avanzar.'], ['¿Cómo se realizan los pagos?', 'Coordinamos una seña para iniciar el proyecto y el saldo se organiza según el avance y la entrega.'], ['¿Hacen envíos?', 'Sí, coordinamos envíos a todo el país. La logística se cotiza según volumen y destino.'], ['¿Qué garantía tienen?', 'Revisamos cada mueble antes de entregarlo y respondemos por la calidad de fabricación y colocación.'], ['¿Cómo se limpia la melamina?', 'Con un paño suave apenas húmedo y detergente neutro. Evitá abrasivos, exceso de agua y productos con solventes.']];
  return <PageIntro eyebrow="Materiales honestos" title={<>Simple de elegir,<br /><em>fácil de cuidar.</em></>} copy="Trabajamos principalmente con aglomerado y melamina porque ofrecen variedad, resistencia y terminaciones prolijas para la vida real." pageClass="bg-white"><div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24"><div className="grid gap-12 lg:grid-cols-2"><div><h2 className="font-display text-4xl">Aglomerado y melamina</h2><p className="mt-6 text-sm leading-7 text-stone">El aglomerado es un tablero formado por partículas de madera prensadas. La melamina es la terminación decorativa que lo recubre y le aporta color, textura y protección. Juntos permiten hacer muebles precisos, versátiles y con una buena relación precio-calidad.</p><div className="mt-9 grid gap-4 sm:grid-cols-2"><p className="flex gap-3 text-sm"><Check size={17} className="text-wood" /> Variedad de colores y texturas</p><p className="flex gap-3 text-sm"><Check size={17} className="text-wood" /> Buena resistencia al uso diario</p><p className="flex gap-3 text-sm"><Check size={17} className="text-wood" /> Terminaciones prolijas con tapacanto</p><p className="flex gap-3 text-sm"><Check size={17} className="text-wood" /> Excelente relación precio-calidad</p></div></div><div className="bg-bone p-7 sm:p-10"><p className="eyebrow">Muestrario</p><h3 className="mt-4 font-display text-3xl">Colores para empezar a imaginar</h3><div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-3">{materialSamples.map((sample) => <div key={sample.name}><div className="aspect-square border border-charcoal/10" style={{ backgroundColor: sample.value }} /><p className="mt-2 text-[10px] font-semibold leading-4 text-stone">{sample.name}</p></div>)}</div><p className="mt-7 text-xs leading-5 text-stone">Los tonos son orientativos. El color final se confirma con muestras físicas del proveedor.</p></div></div><div className="mt-20 grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">Preguntas frecuentes</p><h2 className="mt-4 font-display text-4xl">Antes de elegir, <em>preguntá.</em></h2></div><div className="border-t border-charcoal/15">{faqs.map(([question, answer], index) => <div key={question} className="border-b border-charcoal/15"><button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between py-5 text-left text-sm font-semibold">{question}<ChevronDown size={17} className={`transition-transform ${open === index ? 'rotate-180 text-wood' : ''}`} /></button>{open === index && <p className="max-w-[620px] pb-5 text-sm leading-6 text-stone">{answer}</p>}</div>)}</div></div></div></PageIntro>;
}

function About({ navigate }: { navigate: (path: string) => void }) {
  return <PageIntro eyebrow="Nosotros" title={<>Un taller con los pies<br /><em>en el origen.</em></>} copy="Elite nace de una idea simple: hacer muebles honestos, bien pensados y hechos para acompañar la vida." pageClass="bg-bone"><section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24"><div className="aspect-[.95] overflow-hidden"><img src="https://images.pexels.com/photos/7484794/pexels-photo-7484794.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Herramientas y piezas de madera en el taller" className="h-full w-full object-cover" loading="lazy" /></div><div><p className="eyebrow">El taller</p><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Oficio, compromiso y una mirada puesta en lo cotidiano.</h2><p className="mt-7 text-sm leading-7 text-stone">Somos una carpintería argentina que trabaja con aglomerado y melamina para crear muebles a medida y algunos modelos en serie. Nos interesa que el diseño sea claro, que el material esté bien elegido y que cada mueble resuelva algo de verdad.</p><p className="mt-5 text-sm leading-7 text-stone">Trabajamos con particulares, arquitectos, estudios y comercios. Escuchamos cada proyecto, hacemos preguntas y proponemos con honestidad.</p><button onClick={() => navigate('/a-medida')} className="button-dark mt-8">Hablemos de tu proyecto <ArrowRight size={16} /></button></div></section><section className="bg-charcoal px-5 py-20 text-white lg:px-10 lg:py-24"><div className="mx-auto grid max-w-[1100px] gap-8 sm:grid-cols-3"><div><Package size={23} className="text-wood-light" /><h3 className="mt-5 font-display text-2xl">Origen</h3><p className="mt-2 text-sm leading-6 text-white/60">Materiales claros, proveedores confiables y fabricación local.</p></div><div><ShieldCheck size={23} className="text-wood-light" /><h3 className="mt-5 font-display text-2xl">Compromiso</h3><p className="mt-2 text-sm leading-6 text-white/60">Lo que acordamos, lo cuidamos hasta el final.</p></div><div><PenTool size={23} className="text-wood-light" /><h3 className="mt-5 font-display text-2xl">Oficio</h3><p className="mt-2 text-sm leading-6 text-white/60">Precisión en las medidas y atención en cada terminación.</p></div></div></section></PageIntro>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const message = `Hola Elite, soy ${data.get('name')}.\nMi consulta: ${data.get('message')}`; window.open(whatsappLink(message), '_blank', 'noopener,noreferrer'); setSent(true); }
  return <PageIntro eyebrow="Contacto" title={<>Hablemos de<br /><em>tu espacio.</em></>} copy="Estamos en Buenos Aires y hacemos envíos a todo el país. Escribinos para contarnos tu idea." pageClass="bg-white"><section className="mx-auto grid max-w-[1320px] gap-14 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-24"><div><div className="space-y-6"><a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-start gap-4"><MessageCircle className="mt-1 text-wood" size={21} /><span><strong className="block text-sm">WhatsApp</strong><span className="mt-1 block text-sm text-stone">+54 11 2408-9472</span></span></a><a href="mailto:matias@elitecarpinteria.com.ar" className="flex items-start gap-4"><Mail className="mt-1 text-wood" size={21} /><span><strong className="block text-sm">Email</strong><span className="mt-1 block text-sm text-stone">matias@elitecarpinteria.com.ar</span></span></a><div className="flex items-start gap-4"><MapPin className="mt-1 text-wood" size={21} /><span><strong className="block text-sm">Ubicación</strong><span className="mt-1 block text-sm text-stone">Buenos Aires, Argentina</span></span></div></div><div className="mt-12 flex aspect-video items-center justify-center border border-dashed border-charcoal/20 bg-bone"><div className="text-center text-stone"><MapPin className="mx-auto" size={25} /><p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em]">Mapa de referencia</p><p className="mt-1 text-xs">Buenos Aires · Próximamente</p></div></div></div><div>{sent ? <div className="flex min-h-[350px] flex-col items-center justify-center bg-bone p-8 text-center"><Check size={25} className="text-wood" /><h2 className="mt-5 font-display text-3xl">Mensaje preparado.</h2><p className="mt-3 max-w-[300px] text-sm leading-6 text-stone">Se abrió WhatsApp para que puedas enviarnos tu consulta.</p></div> : <form onSubmit={submit} className="space-y-7 bg-bone p-7 sm:p-10"><Field label="Nombre" name="name" placeholder="Tu nombre" required /><Field label="Consulta" name="message" placeholder="Contanos qué necesitás" as="textarea" required /><button type="submit" className="button-dark w-full justify-center">Enviar consulta <MessageCircle size={16} /></button><a href="mailto:matias@elitecarpinteria.com.ar" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-stone hover:text-wood">O enviar por mail <Mail size={14} /></a></form>}</div></section></PageIntro>;
}

function WhatsAppButton() { return <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp" className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/25 transition-transform hover:scale-105"><MessageCircle size={25} /></a>; }

function Footer({ navigate }: { navigate: (path: string) => void }) {
  const links = [['Muebles', '/muebles'], ['A medida', '/a-medida'], ['Materiales', '/materiales'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto']];
  return <footer className="bg-charcoal px-5 py-12 text-white lg:px-10"><div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.3fr_1fr_1fr]"><div><button onClick={() => navigate('/')} className="text-left"><img src="/logo.png" alt="Elite | Carpintería de Origen" className="h-16 w-24 object-contain object-left" /></button><p className="mt-6 max-w-[270px] text-sm leading-6 text-white/50">Muebles a medida y en serie, hechos en Argentina para acompañar tu manera de vivir.</p></div><div><p className="footer-label">Navegación</p><div className="mt-5 flex flex-col items-start gap-3">{links.map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="text-sm text-white/65 hover:text-wood-light">{label}</button>)}</div></div><div><p className="footer-label">Contacto</p><div className="mt-5 space-y-3 text-sm text-white/65"><a href={whatsappLink()} target="_blank" rel="noreferrer" className="block hover:text-wood-light">+54 11 2408-9472</a><a href="mailto:matias@elitecarpinteria.com.ar" className="block hover:text-wood-light">matias@elitecarpinteria.com.ar</a><a href="#" className="mt-4 flex items-center gap-2 hover:text-wood-light"><Instagram size={15} /> Instagram</a></div></div></div><div className="mx-auto mt-12 flex max-w-[1320px] flex-col justify-between gap-3 border-t border-white/10 pt-5 text-[10px] text-white/35 sm:flex-row"><span>© 2026 Elite Carpintería de Origen</span><span>elitecarpinteria.com.ar</span></div></footer>;
}

export default App;
