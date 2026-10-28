export const productCategories = [
  'Living',
  'Dormitorio',
  'Comedor',
  'Cocina',
  'Placares y vestidores',
  'Escritorios y oficina',
  'Baño',
  'Comercial',
] as const;

export type ProductCategory = (typeof productCategories)[number];
export type ProductKind = 'A medida' | 'En serie';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  kind: ProductKind;
  description: string;
  details: string;
  referenceMeasures: string;
  material: string;
  colors: string[];
  image: string;
  gallery: string[];
};

const image = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

export const products: Product[] = [
  {
    id: 'rack-nordico',
    name: 'Rack Nórdico',
    category: 'Living',
    kind: 'A medida',
    description: 'Una pieza baja y liviana para ordenar la tecnología sin quitarle protagonismo al ambiente.',
    details: 'Frentes lisos, nichos abiertos y pasacables integrado. Lo adaptamos al largo de tu pared y a tus equipos.',
    referenceMeasures: '180 × 45 × 55 cm',
    material: 'Melamina texturada sobre aglomerado de 18 mm',
    colors: ['Roble Natural', 'Blanco Oslo', 'Gris Grafito'],
    image: '/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg',
    gallery: ['/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg', '/WhatsApp_Image_2026-10-28_at_10.47.06_(1).jpeg', image('7214168')],
  },
  {
    id: 'biblioteca-umbral',
    name: 'Biblioteca Umbral',
    category: 'Living',
    kind: 'A medida',
    description: 'Una composición modular para separar, guardar y exhibir con la misma calma visual.',
    details: 'Módulos de guardado cerrado combinados con estantes abiertos. Diseñada para acompañar circulaciones y aprovechar cada centímetro.',
    referenceMeasures: '240 × 35 × 220 cm',
    material: 'Melamina mate con cantos de PVC de 2 mm',
    colors: ['Nogal Sevilla', 'Arena', 'Negro'],
    image: '/WhatsApp_Image_2026-10-28_at_11.06.21_(2).jpeg',
    gallery: ['/WhatsApp_Image_2026-10-28_at_11.06.21_(2).jpeg', '/WhatsApp_Image_2026-10-28_at_11.06.14.jpeg', image('6908561')],
  },
  {
    id: 'placard-linea',
    name: 'Placard Línea',
    category: 'Placares y vestidores',
    kind: 'A medida',
    description: 'Orden interior y una fachada limpia para que el dormitorio respire.',
    details: 'Distribución interior con barrales, cajoneras y estantes regulables. Las puertas se ajustan al ancho, alto y estilo de tu espacio.',
    referenceMeasures: 'A definir según ambiente',
    material: 'Aglomerado melamínico de 18 mm con herrajes reforzados',
    colors: ['Blanco', 'Roble Dakar', 'Gris Ceniza'],
    image: '/WhatsApp_Image_2026-10-28_at_11.06.14.jpeg',
    gallery: ['/WhatsApp_Image_2026-10-28_at_11.06.14.jpeg', '/WhatsApp_Image_2026-10-28_at_11.06.21_(2).jpeg', image('7060824')],
  },
  {
    id: 'cocina-lino',
    name: 'Cocina Lino',
    category: 'Cocina',
    kind: 'A medida',
    description: 'Una cocina pensada alrededor de tus rutinas, con superficies nobles y guardado inteligente.',
    details: 'Diseñamos bajo mesadas, alacenas y torres en conjunto. Podemos sumar interiores extraíbles, botelleros y herrajes de cierre suave.',
    referenceMeasures: 'Proyecto según planta',
    material: 'Melamina texturada y aglomerado hidrófugo en zonas húmedas',
    colors: ['Lino', 'Roble Halifax', 'Verde Oliva'],
    image: '/WhatsApp_Image_2026-10-28_at_10.46.49.jpeg',
    gallery: ['/WhatsApp_Image_2026-10-28_at_10.46.49.jpeg', '/WhatsApp_Image_2026-10-28_at_10.47.06_(1).jpeg', image('29136418')],
  },
  {
    id: 'mesa-origen',
    name: 'Mesa Origen',
    category: 'Comedor',
    kind: 'En serie',
    description: 'Proporciones generosas y un diseño simple para acompañar sobremesas largas.',
    details: 'Modelo disponible en medidas estándar y con opción de adaptar el largo. La tapa y la base se trabajan como una sola pieza visual.',
    referenceMeasures: '180 × 90 × 75 cm',
    material: 'Melamina madera sobre estructura de aglomerado reforzado',
    colors: ['Roble Natural', 'Petiribí', 'Negro'],
    image: '/WhatsApp_Image_2026-10-28_at_10.47.06_(1).jpeg',
    gallery: ['/WhatsApp_Image_2026-10-28_at_10.47.06_(1).jpeg', image('13813470'), image('6908555')],
  },
  {
    id: 'escritorio-trama',
    name: 'Escritorio Trama',
    category: 'Escritorios y oficina',
    kind: 'En serie',
    description: 'Un lugar de trabajo preciso, cálido y suficientemente flexible para todos los días.',
    details: 'Superficie amplia, canal para cables y módulo lateral de guardado. Ideal para home office o espacios profesionales.',
    referenceMeasures: '140 × 60 × 75 cm',
    material: 'Melamina mate sobre aglomerado de alta densidad',
    colors: ['Roble Claro', 'Blanco', 'Verde Musgo'],
    image: image('34549322'),
    gallery: [image('34549322'), image('4231427'), image('9565967')],
  },
  {
    id: 'vanitory-calma',
    name: 'Vanitory Calma',
    category: 'Baño',
    kind: 'A medida',
    description: 'Guardado discreto y materiales preparados para acompañar la humedad del baño.',
    details: 'Módulo suspendido con cajones de extracción total y espacio para instalaciones. Se resuelve según la bacha y la medida real del ambiente.',
    referenceMeasures: '80 × 48 × 55 cm',
    material: 'Melamina resistente a la humedad con cantos sellados',
    colors: ['Blanco', 'Gris Piedra', 'Nogal'],
    image: image('6489108'),
    gallery: [image('6489108'), image('7214168'), image('6908561')],
  },
  {
    id: 'mostrador-estudio',
    name: 'Mostrador Estudio',
    category: 'Comercial',
    kind: 'A medida',
    description: 'Una primera impresión clara para locales, estudios y espacios de atención.',
    details: 'Proyectamos mostradores, exhibidores y guardado de apoyo según circulación, identidad y necesidades de uso.',
    referenceMeasures: 'Proyecto según local',
    material: 'Aglomerado melamínico con refuerzos estructurales',
    colors: ['Roble Natural', 'Blanco', 'Grafito'],
    image: '/WhatsApp_Image_2026-10-28_at_10.46.49.jpeg',
    gallery: ['/WhatsApp_Image_2026-10-28_at_10.46.49.jpeg', image('36777521'), image('18787885')],
  },
];

export const quickCategories = [
  { name: 'Living', image: '/WhatsApp_Image_2026-10-28_at_10.46.54_(2).jpeg', copy: 'Racks, bibliotecas y muebles que ordenan sin pesar.' },
  { name: 'Dormitorio', image: '/WhatsApp_Image_2026-10-28_at_11.06.14.jpeg', copy: 'Placares y vestidores para que cada cosa encuentre su lugar.' },
  { name: 'Cocina y placares', image: image('28272341'), copy: 'Proyectos completos, pensados desde la medida real.' },
];

export const materialSamples = [
  { name: 'Roble Natural', value: '#B89068' },
  { name: 'Lino', value: '#D8CEBB' },
  { name: 'Gris Piedra', value: '#A9A79E' },
  { name: 'Verde Oliva', value: '#737A61' },
  { name: 'Grafito', value: '#343536' },
  { name: 'Blanco Oslo', value: '#F2F0EA' },
];
