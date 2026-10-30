import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Edit3,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PenTool,
  Plus,
  Ruler,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
  ShieldCheck,
  Instagram,
  Facebook,
  MapPin,
  Clock,
} from 'lucide-react';
import { materialSamples, products as initialProducts } from '@/data/products';
import { AdminPanel } from './components/admin/AdminPanel';
import { supabase } from './supabase';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(['Amoblamientos de cocina', 'Revestimientos', 'Placards', 'Muebles a medida']);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  
  const [settings, setSettings] = useState({
    hero_title: 'Diseño de origen para espacios que viven con vos.',
    hero_image_url: '/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg',
    phone: '+54 11 2408-9472',
    email: 'matias@elitecarpinteria.com.ar',
    whatsapp: '5491124089472',
    favicon_url: '/logo.png',
    logo_url: '/logo.png',
    header_announcement: 'Fabricación propia · Muebles a medida · Envíos a todo el país',
    about_title: 'Un taller con los pies en el origen.',
    about_text: 'Elite nace de hacer muebles honestos, sólidos y bien pensados. Trabajamos cada placa entendiendo su veta, su resistencia y la forma en que va a integrarse a tu rutina diaria.',
    about_image: 'https://images.pexels.com/photos/7484794/pexels-photo-7484794.jpeg?auto=compress&cs=tinysrgb&w=1200',
    custom_title: 'Un mueble a medida empieza por escucharte.',
    custom_text: 'Diseñamos cada pieza alrededor de tu espacio, tus hábitos y tu forma de usarlo para garantizar funcionalidad y estética impecable.',
    custom_image_url: '',
    materials_title: 'Simple de elegir, fácil de cuidar.',
    materials_text: 'Trabajamos principalmente con aglomerado y melamina de primera calidad, asegurando durabilidad, terminaciones limpias y fácil mantenimiento.',
    materials_image_url: '',
    payment_title: 'Modos de Pago',
    payment_text: 'Aceptamos transferencias bancarias, tarjetas de crédito y efectivo con descuentos especiales.',
    payment_image_url: '',
    contact_title: 'Hablemos de tu espacio.',
    contact_subtitle: 'Buenos Aires, Argentina.',
    footer_text: 'Elite Carpintería de Origen © 2026. Todos los derechos reservados.',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    footer_address: '',
    footer_hours: '',
    show_social_in_footer: true,
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const WHATSAPP_URL = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`;
  const WHATSAPP_MESSAGE = 'Hola Elite, quisiera consultar por un mueble a medida.';
  const whatsappLink = (message = WHATSAPP_MESSAGE) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price || 0, quantity: 1, image: product.image }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const sendCartToWhatsApp = () => {
    if (cart.length === 0) return;
    let message = `🛒 *NUEVO PEDIDO DESDE LA WEB*\n\n`;
    cart.forEach((item, index) => {
      const itemPrice = item.price > 0 ? `$${(item.price * item.quantity).toLocaleString('es-AR')}` : 'A consultar';
      message += `${index + 1}. *${item.name}* x${item.quantity} - ${itemPrice}\n`;
    });
    message += `\n💰 *Total Estimado:* ${totalCartPrice > 0 ? `$${totalCartPrice.toLocaleString('es-AR')}` : 'A consultar'}\n\n`;
    message += `Hola Elite, quisiera coordinar la compra/presupuesto de estos productos.`;

    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    async function fetchData() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        setIsAdminLoggedIn(true);
      }

      // Cargar productos
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
          is_featured: item.is_featured || false,
        }));
        setProducts(formatted);
      }

      // Cargar categorías
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData && catData.length > 0) {
        setCategories(catData.map((c: any) => c.name));
      }

      // Cargar Testimonios
      const { data: testData } = await supabase.from('testimonials').select('*').order('created_at', { ascending: true });
      if (testData && testData.length > 0) {
        setTestimonials(testData);
      }

      // Cargar Pasos del Proceso
      const { data: stepData } = await supabase.from('process_steps').select('*').order('order_index', { ascending: true });
      if (stepData && stepData.length > 0) {
        setProcessSteps(stepData);
      }

      // Cargar Configuración del Sitio (Garantizando fusionar TODOS los campos)
      const { data: setmData } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (setmData) {
        setSettings((prev) => ({
          ...prev,
          ...setmData,
          show_social_in_footer: setmData.show_social_in_footer ?? true,
        }));
        if (setmData.favicon_url) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = setmData.favicon_url;
        }
      }
    }
    fetchData();
  }, [route]);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setRoute(path as Route);
    setMenuOpen(false);
  }

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-bone text-charcoal relative">
      {isAdminLoggedIn && route !== '/admin' && (
        <div className="bg-wood text-white px-4 py-2 flex justify-between items-center text-xs sticky top-0 z-50 shadow-md">
          <span className="font-bold flex items-center gap-1.5"><Sparkles size={14} /> Modo Edición Activo</span>
          <button onClick={() => navigate('/admin')} className="bg-charcoal text-white px-3 py-1 rounded font-bold uppercase text-[10px] hover:bg-black flex items-center gap-1">
            <Edit3 size={12} /> Ir al Panel Admin completo
          </button>
        </div>
      )}

      {route !== '/admin' && <TopNotice settings={settings} />}
      {route !== '/admin' && (
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          navigate={navigate}
          whatsappLink={whatsappLink}
          cartCount={cartTotalItems}
          onOpenCart={() => setCartOpen(true)}
          settings={settings}
        />
      )}

      {/* DRAWER DEL CARRITO DE COMPRAS */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/60 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col bg-bone p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-wood" />
                <h2 className="font-display text-2xl font-bold">Tu Pedido ({cartTotalItems})</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-stone-light">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-stone">
                  <ShoppingBag size={48} className="mb-3 stroke-1 text-stone/50" />
                  <p className="text-sm font-semibold">El carrito está vacío</p>
                  <p className="text-xs text-stone/80 mt-1">Explorá nuestros muebles y agregá lo que te guste.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-charcoal/10 pb-4 bg-white p-3 rounded shadow-sm">
                    <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded shrink-0" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="font-display text-base font-bold leading-tight">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-stone hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-wood mt-1">
                          {item.price > 0 ? `$${item.price.toLocaleString('es-AR')}` : 'A consultar'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-charcoal/20 rounded bg-bone">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-stone hover:text-charcoal">
                            <Minus size={14} />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-stone hover:text-charcoal">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-charcoal/10 pt-4 space-y-4">
                <div className="flex justify-between items-center text-base font-bold">
                  <span>Total estimado:</span>
                  <span className="text-xl text-charcoal">
                    {totalCartPrice > 0 ? `$${totalCartPrice.toLocaleString('es-AR')}` : 'A consultar'}
                  </span>
                </div>
                <button onClick={sendCartToWhatsApp} className="button-dark w-full justify-center py-4 text-xs font-bold uppercase tracking-wider">
                  Enviar Pedido por WhatsApp <MessageCircle size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main>
        {route === '/' && <Home navigate={navigate} products={products} settings={settings} whatsappLink={whatsappLink} addToCart={addToCart} testimonials={testimonials} processSteps={processSteps} />}
        {route === '/muebles' && <Catalog navigate={navigate} products={products} categories={categories} addToCart={addToCart} />}
        {route.startsWith('/muebles/') && (
          <ProductDetail
            product={products.find((item) => `/muebles/${item.id}` === route) ?? products[0]}
            navigate={navigate}
            whatsappLink={whatsappLink}
            addToCart={addToCart}
          />
        )}
        {route === '/a-medida' && <CustomMade settings={settings} whatsappLink={whatsappLink} />}
        {route === '/materiales' && <Materials settings={settings} />}
        {route === '/nosotros' && <About navigate={navigate} settings={settings} />}
        {route === '/contacto' && <Contact settings={settings} whatsappLink={whatsappLink} />}
        {route === '/admin' && (
          <AdminPanel
            navigate={navigate}
            categories={categories}
            settings={settings}
            onSettingsChange={(nextSettings) => setSettings(nextSettings)}
            onCategoryAdded={async () => {
              const { data } = await supabase.from('categories').select('*');
              if (data) setCategories(data.map((c: any) => c.name));
            }}
          />
        )}
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

function TopNotice({ settings }: { settings: any }) {
  return <div className="bg-charcoal px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75">{settings.header_announcement}</div>;
}

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  navigate: (path: string) => void;
  whatsappLink: () => string;
  cartCount: number;
  onOpenCart: () => void;
  settings: any;
};

function Header({ menuOpen, setMenuOpen, navigate, whatsappLink, cartCount, onOpenCart, settings }: HeaderProps) {
  const links = [['Muebles', '/muebles'], ['A medida', '/a-medida'], ['Materiales', '/materiales'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto']];
  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-bone/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 lg:px-10">
        <button onClick={() => navigate('/')} className="group text-left" aria-label="Ir al inicio">
          <img src={settings.logo_url || '/logo.png'} alt="Elite | Carpintería de Origen" className="h-16 w-32 object-contain object-left bg-transparent" />
        </button>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, path]) => (
            <button key={path} onClick={() => navigate(path)} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal/65 transition-colors hover:text-wood">
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={onOpenCart} className="relative flex items-center gap-2 border border-charcoal/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-charcoal hover:bg-stone-light">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wood text-[10px] text-white">{cartCount}</span>}
          </button>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hidden items-center gap-2 bg-wood px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-charcoal sm:flex">
            Pedir presupuesto <ArrowUpRight size={14} />
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full border border-charcoal/15 p-2 lg:hidden" aria-label="Abrir menú">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-charcoal/10 bg-bone px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-5">
            {links.map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} className="text-left text-[11px] font-bold uppercase tracking-[0.16em]">{label}</button>
            ))}
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-wood">
              <MessageCircle size={16} /> Pedir presupuesto
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Home({ navigate, products, settings, whatsappLink, addToCart, testimonials, processSteps }: { navigate: (path: string) => void; products: any[]; settings: any; whatsappLink: (msg?: string) => string; addToCart: (product: any) => void; testimonials: any[]; processSteps: any[] }) {
  const featured = products.filter((p) => p.is_featured);
  const displayProducts = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <>
      <section className="relative min-h-[680px] overflow-hidden bg-charcoal text-white lg:min-h-[calc(100vh-74px)]">
        <img src={settings.hero_image_url || "/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg"} alt="Mueble de living" className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/55 to-charcoal/10" />
        <div className="relative mx-auto flex min-h-[680px] max-w-[1320px] items-end px-5 pb-20 pt-24 lg:min-h-[calc(100vh-74px)] lg:px-10 lg:pb-28">
          <div className="max-w-[720px] animate-rise">
            <p className="eyebrow text-wood-light">Elite <span className="mx-2 text-white/40">/</span> Diseño de origen</p>
            <h1 className="mt-6 font-display text-5xl leading-[.96] tracking-[-.045em] sm:text-7xl lg:text-[7rem]">
              Diseño de origen<br /><em className="text-wood-light">{settings.hero_title}</em>
            </h1>
            <p className="mt-8 max-w-[430px] text-base leading-7 text-white/75">Diseñamos y fabricamos muebles en aglomerado y melamina para que tu casa tenga exactamente lo que necesitás.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => navigate('/muebles')} className="button-primary">Ver muebles <ArrowRight size={16} /></button>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="button-outline">Cotizá por WhatsApp <MessageCircle size={16} /></a>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts navigate={navigate} products={displayProducts} addToCart={addToCart} />
      <Process steps={processSteps} />
      <Benefits />
      <Testimonials testimonials={testimonials} />
    </>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: React.ReactNode; copy?: string }) {
  return (
    <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
      <div><p className="eyebrow">{eyebrow}</p><h2 className="section-title mt-4">{title}</h2></div>
      {copy && <p className="max-w-[320px] text-sm leading-6 text-stone">{copy}</p>}
    </div>
  );
}

function FeaturedProducts({ navigate, products, addToCart }: { navigate: (path: string) => void; products: any[]; addToCart: (p: any) => void }) {
  return (
    <section className="bg-white px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading eyebrow="01 / Muebles destacados" title={<>Diseñados para <em>quedarse.</em></>} copy="Algunos modelos para inspirarte. Todo se puede adaptar a tus medidas y necesidades." />
        <div className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
          ))}
        </div>
        <div className="mt-14 text-center">
          <button onClick={() => navigate('/muebles')} className="button-dark">Ver todos los muebles <ArrowRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, navigate, addToCart }: { product: any; navigate: (path: string) => void; addToCart: (p: any) => void }) {
  const formattedPrice = product.price && product.price > 0 
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)
    : 'A consultar';

  return (
    <article className="group flex flex-col justify-between">
      <div>
        <button onClick={() => navigate(`/muebles/${product.id}`)} className="block w-full text-left">
          <div className="relative aspect-[.88] overflow-hidden bg-stone-light">
            <img src={product.image} alt={`${product.name}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <span className="absolute left-3 top-3 bg-bone/90 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-charcoal">{product.kind || 'A medida'}</span>
          </div>
          <div className="pt-4">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-wood">{product.category}</p>
              <span className="text-xs font-bold text-charcoal">{formattedPrice}</span>
            </div>
            <h3 className="mt-2 font-display text-2xl">{product.name}</h3>
            <p className="mt-2 text-sm leading-6 text-stone line-clamp-2">{product.description}</p>
          </div>
        </button>
      </div>
      <button onClick={() => addToCart(product)} className="mt-4 flex items-center justify-center gap-2 border border-charcoal/20 py-2.5 text-[10px] font-bold uppercase tracking-[0.13em] text-charcoal hover:bg-charcoal hover:text-white transition-colors">
        <Plus size={14} /> Agregar al Carrito
      </button>
    </article>
  );
}

function Process({ steps }: { steps: any[] }) {
  const defaultSteps = steps.length > 0 ? steps : [
    { step_number: '01', title: 'Consulta', description: 'Nos contás qué necesitás, dónde va y cómo te gustaría que se sienta.' },
    { step_number: '02', title: 'Diseño y medidas', description: 'Pensamos la distribución y definimos medidas, material, color y detalles.' },
    { step_number: '03', title: 'Fabricación', description: 'Cortamos, canteamos y armamos en nuestro taller con atención en cada terminación.' },
    { step_number: '04', title: 'Entrega e instalación', description: 'Coordinamos la entrega y dejamos tu mueble listo para usar.' }
  ];

  return (
    <section className="bg-bone px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading eyebrow="02 / Cómo trabajamos" title={<>De la idea a tu casa, <em>sin vueltas.</em></>} />
        <div className="mt-14 grid gap-0 border-t border-charcoal/15 md:grid-cols-4">
          {defaultSteps.map((step) => (
            <div key={step.id || step.step_number} className="border-b border-charcoal/15 py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
              <span className="font-display text-3xl text-wood">{step.step_number}</span>
              <h3 className="mt-7 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    [PenTool, 'Fabricación propia', 'Lo hacemos en nuestro taller, de principio a fin.'],
    [Ruler, 'A medida o en serie', 'Una pieza única o un modelo repetible, según tu proyecto.'],
    [Truck, 'Envíos a todo el país', 'Coordinamos la logística para que llegue a donde estés.'],
    [Sparkles, 'Atención personalizada', 'Te acompañamos para tomar buenas decisiones.']
  ];
  return (
    <section className="border-y border-charcoal/10 bg-white px-5 py-16 lg:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-9 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(([Icon, title, copy]) => (
          <div key={title as string} className="flex gap-4">
            <Icon size={22} strokeWidth={1.4} className="shrink-0 text-wood" />
            <div><h3 className="text-sm font-bold">{title as string}</h3><p className="mt-2 text-xs leading-5 text-stone">{copy as string}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ testimonials }: { testimonials: any[] }) {
  const defaultList = testimonials.length > 0 ? testimonials : [
    { quote: 'Nos ayudaron a ordenar una cocina complicada y el resultado quedó impecable. Se nota el cuidado en cada detalle.', author: 'Lucía M.', location: 'Colegiales' },
    { quote: 'Pedimos un placard con medidas muy específicas y cumplieron con los tiempos y la instalación.', author: 'Tomás R.', location: 'Vicente López' },
    { quote: 'El escritorio quedó hermoso y mucho más sólido de lo que esperábamos. La atención fue muy clara.', author: 'Sofía G.', location: 'La Plata' }
  ];

  return (
    <section className="bg-bone px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading eyebrow="03 / Lo que dicen" title={<>Hecho para la vida <em>real.</em></>} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {defaultList.map((t, idx) => (
            <blockquote key={t.id || idx} className="border border-charcoal/12 bg-white p-7">
              <span className="font-display text-4xl text-wood">“</span>
              <p className="mt-2 font-display text-xl leading-8">{t.quote}</p>
              <footer className="mt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-stone">{t.author} {t.location ? `· ${t.location}` : ''}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Catalog({ navigate, products, categories, addToCart }: { navigate: (path: string) => void; products: any[]; categories: string[]; addToCart: (p: any) => void }) {
  const [filter, setFilter] = useState<string>('Todos');
  const filtered = useMemo(() => filter === 'Todos' ? products : products.filter((product) => product.category === filter), [filter, products]);
  return (
    <div className="bg-white">
      <section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow">Colección Elite</p>
          <h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">Muebles que se adaptan<br /><em>a tu manera de vivir.</em></h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-stone">Explorá nuestros modelos de referencia. Cada producto puede personalizarse en medidas, color y distribución.</p>
        </div>
      </section>
      <div className="mx-auto max-w-[1320px] px-5 py-12 lg:px-10">
        <div className="flex gap-2 overflow-x-auto border-b border-charcoal/15 pb-3">
          {['Todos', ...categories].map((category) => (
            <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] ${filter === category ? 'border-b-2 border-wood text-wood' : 'text-stone hover:text-charcoal'}`}>
              {category}
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product, navigate, whatsappLink, addToCart }: { product: any; navigate: (path: string) => void; whatsappLink: (msg?: string) => string; addToCart: (p: any) => void }) {
  const formattedPrice = product.price && product.price > 0 
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)
    : 'Precio a consultar';

  return (
    <div className="bg-bone">
      <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-20 lg:px-10 lg:py-20">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 aspect-[1.4] overflow-hidden bg-stone-light">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="self-center">
          <button onClick={() => navigate('/muebles')} className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone hover:text-wood">
            <ArrowLeft size={14} /> Volver a muebles
          </button>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-4 font-display text-5xl leading-none tracking-[-.04em] sm:text-6xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="inline-block border border-wood px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-wood">{product.kind || 'A medida'}</span>
            <span className="text-2xl font-bold text-charcoal">{formattedPrice}</span>
          </div>
          <p className="mt-8 text-base leading-7 text-stone">{product.details || product.description}</p>
          <div className="mt-10 grid gap-5 border-y border-charcoal/15 py-6 text-sm sm:grid-cols-2">
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-stone">Medidas de referencia</p><p className="mt-2 font-semibold">A medida según espacio</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-stone">Material</p><p className="mt-2 font-semibold">Melamina / Aglomerado</p></div>
          </div>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <button onClick={() => addToCart(product)} className="button-dark flex-1 justify-center">
              <Plus size={16} /> Agregar al Carrito
            </button>
            <a href={whatsappLink(`Hola Elite, quisiera consultar por ${product.name} (${formattedPrice}).`)} target="_blank" rel="noreferrer" className="button-outline flex-1 justify-center">
              Consultar por WhatsApp <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function CustomMade({ settings, whatsappLink }: { settings: any; whatsappLink: (msg?: string) => string }) {
  return (
    <div className="bg-bone">
      <section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow">El servicio</p>
          <h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{settings.custom_title}</h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-stone">{settings.custom_text}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-24">
        <div>
          <p className="eyebrow">Diseño que resuelve</p>
          <h2 className="mt-4 font-display text-4xl leading-tight">La medida justa no es solo un número.</h2>
          <p className="mt-6 text-sm leading-7 text-stone">Es entender cómo circulás, qué querés guardar, dónde necesitás apoyo y qué querés ver cuando entrás a tu casa.</p>
          {settings.custom_image_url && <img src={settings.custom_image_url} alt="A medida" className="mt-8 rounded shadow-md w-full aspect-[16/9] object-cover" />}
        </div>
        <QuoteForm whatsappLink={whatsappLink} />
      </section>
    </div>
  );
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
  return (
    <form onSubmit={submit} className="grid gap-6 bg-white p-6 sm:grid-cols-2 sm:p-10 shadow-sm border border-charcoal/10">
      <Field label="Nombre" name="name" placeholder="Tu nombre" required />
      <Field label="Teléfono" name="phone" placeholder="11 2408-9472" required />
      <Field label="Email" name="email" type="email" placeholder="tu@email.com" required />
      <Field label="Tipo de mueble" name="furniture" as="select" options={['Cocina', 'Placard o vestidor', 'Living', 'Escritorio', 'Baño', 'Otro']} required />
      <Field label="Medidas aproximadas" name="measures" placeholder="Ancho x alto x profundidad" />
      <Field label="Material o color preferido" name="material" placeholder="Ej. Roble, blanco, melamina" />
      <Field label="Zona de entrega" name="zone" placeholder="Localidad / provincia" required />
      <Field label="Comentarios" name="comments" placeholder="Contanos un poco más" as="textarea" />
      <button type="submit" className="button-dark sm:col-span-2 sm:justify-center">Enviar por WhatsApp <MessageCircle size={16} /></button>
    </form>
  );
}

type FieldProps = { label: string; name: string; placeholder?: string; type?: string; as?: 'input' | 'select' | 'textarea'; options?: string[]; required?: boolean };
function Field({ label, name, placeholder, type = 'text', as = 'input', options = [], required = false }: FieldProps) {
  return <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70"><span>{label}</span>{as === 'select' ? <select name={name} defaultValue="" required={required} className="w-full border p-3 rounded mt-1 bg-bone text-charcoal text-sm"><option value="" disabled>Seleccioná una opción</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : as === 'textarea' ? <textarea name={name} placeholder={placeholder} rows={4} required={required} className="w-full border p-3 rounded mt-1 bg-bone text-charcoal text-sm" /> : <input name={name} type={type} placeholder={placeholder} required={required} className="w-full border p-3 rounded mt-1 bg-bone text-charcoal text-sm" />}</label>;
}

function Materials({ settings }: { settings: any }) {
  return (
    <div className="bg-white">
      <section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28 bg-bone">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow">Materiales honestos</p>
          <h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{settings.materials_title}</h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-stone">{settings.materials_text}</p>
        </div>
      </section>
      <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-4xl">Aglomerado y melamina</h2>
            <p className="mt-6 text-sm leading-7 text-stone">El aglomerado es un tablero formado por partículas de madera prensadas con recubrimiento de melamina, ofreciendo una superficie durable, estética y de fácil mantenimiento.</p>
            {settings.materials_image_url && <img src={settings.materials_image_url} alt="Materiales" className="mt-6 w-full aspect-[16/9] object-cover rounded shadow" />}
          </div>
          <div className="bg-bone p-7 sm:p-10 border border-charcoal/10">
            <p className="eyebrow">Muestrario de referencia</p>
            <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-3">
              {materialSamples.map((sample) => (
                <div key={sample.name}><div className="aspect-square border border-charcoal/10 shadow-sm" style={{ backgroundColor: sample.value }} /><p className="mt-2 text-[10px] font-semibold leading-4 text-stone">{sample.name}</p></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function About({ navigate, settings }: { navigate: (path: string) => void; settings: any }) {
  return (
    <div className="bg-bone">
      <section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow">Nosotros</p>
          <h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{settings.about_title}</h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-stone">Elite nace de hacer muebles honestos y bien pensados.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
        <div className="aspect-[.95] overflow-hidden rounded border border-charcoal/10 shadow-sm">
          <img src={settings.about_image} alt="Taller" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div>
          <h2 className="font-display text-4xl leading-tight">Tradición y precisión en cada mueble.</h2>
          <p className="mt-7 text-sm leading-7 text-stone">{settings.about_text}</p>
          <button onClick={() => navigate('/a-medida')} className="button-dark mt-8">Hablemos de tu proyecto <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}

function Contact({ settings, whatsappLink }: { settings: any; whatsappLink: (msg?: string) => string }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = `Hola Elite, soy ${data.get('name')}.\nMi consulta: ${data.get('message')}`;
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
    setSent(true);
  }

  return (
    <div className="bg-white">
      <section className="border-b border-charcoal/10 px-5 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28 bg-bone">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow">Contacto</p>
          <h1 className="mt-5 font-display text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">{settings.contact_title}</h1>
          <p className="mt-7 max-w-[500px] text-base leading-7 text-stone">{settings.contact_subtitle}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1320px] gap-14 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-24">
        <div className="space-y-8">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="flex items-start gap-4 group">
            <MessageCircle className="mt-1 text-wood group-hover:scale-110 transition-transform" size={24} />
            <span><strong className="block text-sm uppercase tracking-wider">WhatsApp</strong><span className="mt-1 block text-sm text-stone">{settings.phone}</span></span>
          </a>
          <div className="flex items-start gap-4">
            <Mail className="mt-1 text-wood" size={24} />
            <span><strong className="block text-sm uppercase tracking-wider">Email institucional</strong><span className="mt-1 block text-sm text-stone">{settings.email}</span></span>
          </div>

          <div className="border-t border-charcoal/10 pt-6 space-y-3">
            <strong className="block text-sm uppercase tracking-wider text-wood flex items-center gap-2"><ShieldCheck size={18}/> {settings.payment_title || 'Modos de Pago'}</strong>
            <p className="text-xs text-stone leading-relaxed">{settings.payment_text}</p>
            {settings.payment_image_url && <img src={settings.payment_image_url} alt="Métodos de pago" className="mt-2 h-12 object-contain" />}
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-6 bg-bone p-6 sm:p-10 border border-charcoal/10">
          <Field label="Nombre" name="name" placeholder="Tu nombre" required />
          <Field label="Mensaje" name="message" placeholder="Escribinos tu consulta..." as="textarea" required />
          <button type="submit" className="button-dark sm:justify-center">{sent ? '¡Enviado!' : 'Enviar mensaje'} <MessageCircle size={16} /></button>
        </form>
      </section>
    </div>
  );
}

function Footer({ navigate, settings }: { navigate: (path: string) => void; settings: any }) {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal px-5 py-12 text-white/70 lg:px-10">
      <div className="mx-auto max-w-[1320px] flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h3 className="font-display text-xl text-white">Elite Carpintería de Origen</h3>
          <p className="mt-1 text-xs text-white/50">{settings.phone} · {settings.email}</p>
        </div>

        {(settings.footer_address || settings.footer_hours) && (
          <div className="flex flex-col sm:flex-row gap-4 text-xs text-white/70">
            {settings.footer_address && (
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-wood" /> {settings.footer_address}</span>
            )}
            {settings.footer_hours && (
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-wood" /> {settings.footer_hours}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-6">
          {settings.show_social_in_footer && (
            <div className="flex items-center gap-3">
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" title="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-wood">
                  <Instagram size={18} />
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" title="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-wood">
                  <Facebook size={18} />
                </a>
              )}
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noreferrer" title="TikTok" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-wood">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.22V8.05a6.34 6.34 0 0 0-5.12 6.2 6.34 6.34 0 1 0 11.46-3.83 8.3 8.3 0 0 0 3.77.92V8.12a4.8 4.8 0 0 1-.05-1.43z"/></svg>
                </a>
              )}
            </div>
          )}
          <p className="text-xs text-white/40">{settings.footer_text}</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton({ whatsappLink }: { whatsappLink: (msg?: string) => string }) {
  return (
    <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform">
      <MessageCircle size={28} />
    </a>
  );
}