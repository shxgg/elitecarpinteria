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
  CreditCard,
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
    about_text: 'Somos una carpintería argentina que trabaja con aglomerado y melamina.',
    about_image: 'https://images.pexels.com/photos/7484794/pexels-photo-7484794.jpeg?auto=compress&cs=tinysrgb&w=1200',
    custom_title: 'Un mueble a medida empieza por escucharte.',
    custom_text: 'Diseñamos cada pieza alrededor de tu espacio, tus hábitos y tu forma de usarlo.',
    custom_image_url: '',
    materials_title: 'Simple de elegir, fácil de cuidar.',
    materials_text: 'Trabajamos principalmente con aglomerado y melamina.',
    materials_image_url: '',
    payment_title: 'Modos de Pago',
    payment_text: 'Aceptamos transferencias, tarjetas de crédito y efectivo.',
    payment_image_url: '',
    contact_title: 'Hablemos de tu espacio.',
    contact_subtitle: 'Buenos Aires, Argentina.',
    footer_text: 'Elite Carpintería de Origen © 2026. Todos los derechos reservados.',
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

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData && catData.length > 0) {
        setCategories(catData.map((c: any) => c.name));
      }

      // Solución aplicada: .maybeSingle() en lugar de .single() para evitar el error 406
      const { data: setmData } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (setmData) {
        setSettings({
          hero_title: setmData.hero_title || settings.hero_title,
          hero_image_url: setmData.hero_image_url || settings.hero_image_url,
          phone: setmData.phone || settings.phone,
          email: setmData.email || settings.email,
          whatsapp: setmData.whatsapp || settings.whatsapp,
          favicon_url: setmData.favicon_url || '/logo.png',
          logo_url: setmData.logo_url || '/logo.png',
          header_announcement: setmData.header_announcement || settings.header_announcement,
          about_title: setmData.about_title || settings.about_title,
          about_text: setmData.about_text || settings.about_text,
          about_image: setmData.about_image || settings.about_image,
          custom_title: setmData.custom_title || settings.custom_title,
          custom_text: setmData.custom_text || settings.custom_text,
          custom_image_url: setmData.custom_image_url || settings.custom_image_url,
          materials_title: setmData.materials_title || settings.materials_title,
          materials_text: setmData.materials_text || settings.materials_text,
          materials_image_url: setmData.materials_image_url || settings.materials_image_url,
          payment_title: setmData.payment_title || settings.payment_title,
          payment_text: setmData.payment_text || settings.payment_text,
          payment_image_url: setmData.payment_image_url || settings.payment_image_url,
          contact_title: setmData.contact_title || settings.contact_title,
          contact_subtitle: setmData.contact_subtitle || settings.contact_subtitle,
          footer_text: setmData.footer_text || settings.footer_text,
        });

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
        {route === '/' && <Home navigate={navigate} products={products} settings={settings} whatsappLink={whatsappLink} addToCart={addToCart} />}
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

function Home({ navigate, products, settings, whatsappLink, addToCart }: { navigate: (path: string) => void; products: any[]; settings: any; whatsappLink: (msg?: string) => string; addToCart: (product: any) => void }) {
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
      <FeaturedProducts navigate={navigate} products={products} addToCart={addToCart} />
    </>
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
            <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="pt-4">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-wood">{product.category}</p>
              <span className="text-xs font-bold text-charcoal">{formattedPrice}</span>
            </div>
            <h3 className="mt-2 font-display text-2xl">{product.name}</h3>
          </div>
        </button>
      </div>
      <button onClick={() => addToCart(product)} className="mt-4 flex items-center justify-center gap-2 border border-charcoal/20 py-2.5 text-[10px] font-bold uppercase tracking-[0.13em] text-charcoal hover:bg-charcoal hover:text-white transition-colors">
        <Plus size={14} /> Agregar al Carrito
      </button>
    </article>
  );
}

function FeaturedProducts({ navigate, products, addToCart }: { navigate: (path: string) => void; products: any[]; addToCart: (p: any) => void }) {
  return (
    <section className="bg-white px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex justify-between items-end">
          <div><p className="eyebrow">01 / Muebles destacados</p><h2 className="section-title mt-4">Diseñados para <em>quedarse.</em></h2></div>
        </div>
        <div className="mt-12 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
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
    <div className="bg-white px-5 py-20 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex gap-2 overflow-x-auto border-b border-charcoal/15 pb-3 mb-10">
          {['Todos', ...categories].map((category) => (
            <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] ${filter === category ? 'border-b-2 border-wood text-wood' : 'text-stone hover:text-charcoal'}`}>
              {category}
            </button>
          ))}
        </div>
        <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
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
    <div className="bg-bone py-12 px-5 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <button onClick={() => navigate('/muebles')} className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone hover:text-wood">
          <ArrowLeft size={14} /> Volver a muebles
        </button>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[1.3] bg-stone-light overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="eyebrow">{product.category}</p>
            <h1 className="font-display text-4xl mt-2">{product.name}</h1>
            <p className="text-2xl font-bold text-charcoal mt-3">{formattedPrice}</p>
            <p className="mt-4 text-stone text-sm leading-relaxed">{product.description}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => addToCart(product)} className="button-dark flex-1 justify-center">
                <Plus size={16} /> Agregar al Carrito
              </button>
              <a href={whatsappLink(`Hola Elite, quisiera consultar por ${product.name} (${formattedPrice}).`)} target="_blank" rel="noreferrer" className="button-outline flex-1 justify-center">
                Consultar por WhatsApp <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomMade({ settings, whatsappLink }: { settings: any; whatsappLink: (msg?: string) => string }) {
  return (
    <div className="bg-bone py-20 px-5 lg:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="font-display text-4xl">{settings.custom_title}</h1>
        <p className="mt-4 text-stone max-w-2xl mx-auto">{settings.custom_text}</p>
        {settings.custom_image_url && <img src={settings.custom_image_url} alt="Muebles a medida" className="mt-10 w-full aspect-[16/9] object-cover rounded shadow-md" />}
        <div className="mt-10">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="button-dark inline-flex">Consultar por WhatsApp <MessageCircle size={16} /></a>
        </div>
      </div>
    </div>
  );
}

function Materials({ settings }: { settings: any }) {
  return (
    <div className="bg-white py-20 px-5 lg:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="font-display text-4xl">{settings.materials_title}</h1>
        <p className="mt-4 text-stone max-w-2xl mx-auto">{settings.materials_text}</p>
        {settings.materials_image_url && <img src={settings.materials_image_url} alt="Materiales" className="mt-10 w-full aspect-[16/9] object-cover rounded shadow-md" />}
        <div className="mt-12 grid grid-cols-3 sm:grid-cols-6 gap-4">
          {materialSamples.map((sample) => (
            <div key={sample.name} className="text-center">
              <div className="aspect-square border border-charcoal/10 rounded" style={{ backgroundColor: sample.value }} />
              <p className="mt-2 text-[10px] font-semibold text-stone">{sample.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function About({ navigate, settings }: { navigate: (path: string) => void; settings: any }) {
  return (
    <div className="bg-bone py-20 px-5 lg:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-4xl">{settings.about_title}</h1>
        <p className="mt-6 text-stone leading-relaxed">{settings.about_text}</p>
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded shadow-md max-w-2xl mx-auto">
          <img src={settings.about_image} alt="Nosotros" className="w-full h-full object-cover" />
        </div>
        <button onClick={() => navigate('/a-medida')} className="button-dark mt-8 inline-flex">Hablemos de tu proyecto <ArrowRight size={16} /></button>
      </div>
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
    <div className="bg-white py-20 px-5 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl">{settings.contact_title}</h1>
        <p className="mt-2 text-stone">{settings.contact_subtitle}</p>
        <p className="mt-1 text-xs text-stone">WhatsApp: {settings.phone} · Email: {settings.email}</p>
        <form onSubmit={submit} className="mt-10 grid gap-6 bg-bone p-8 text-left rounded-lg shadow-sm">
          <label className="block text-xs font-bold uppercase">
            <span>Nombre</span>
            <input name="name" placeholder="Tu nombre" required className="w-full border p-3 rounded mt-1 text-sm bg-white" />
          </label>
          <label className="block text-xs font-bold uppercase">
            <span>Mensaje</span>
            <textarea name="message" placeholder="¿En qué podemos ayudarte?" rows={4} required className="w-full border p-3 rounded mt-1 text-sm bg-white" />
          </label>
          <button type="submit" className="button-dark justify-center">{sent ? '¡Enviado!' : 'Enviar consulta'} <MessageCircle size={16} /></button>
        </form>
      </div>
    </div>
  );
}

function Footer({ navigate, settings }: { navigate: (path: string) => void; settings: any }) {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal px-5 py-16 text-white/70 text-center text-xs space-y-2">
      <p>{settings.phone} · {settings.email}</p>
      <p className="text-white/40">{settings.footer_text}</p>
    </footer>
  );
}

function WhatsAppButton({ whatsappLink }: { whatsappLink: (msg?: string) => string }) {
  return (
    <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg">
      <MessageCircle size={26} />
    </a>
  );
}