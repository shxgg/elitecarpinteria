import { ChangeEvent, useState } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { SiteSettings } from './AdminPanel';

type ImageSpec = { dimensions: string; ratio: string; formats: string; maxSize: string; hint: string };

const SPECS: Record<string, ImageSpec> = {
  hero_image_url: { dimensions: '1920 × 1080 px', ratio: '16:9', formats: 'JPG / WEBP', maxSize: '≤ 2 MB', hint: 'Banner horizontal.' },
  about_image: { dimensions: '1200 × 900 px', ratio: '4:3', formats: 'JPG / WEBP', maxSize: '≤ 1.5 MB', hint: 'Ideal para taller o equipo.' },
  custom_image_url: { dimensions: '1600 × 900 px', ratio: '16:9', formats: 'JPG / WEBP', maxSize: '≤ 2 MB', hint: 'Proyectos y ambientes.' },
  materials_image_url: { dimensions: '1600 × 900 px', ratio: '16:9', formats: 'JPG / WEBP', maxSize: '≤ 2 MB', hint: 'Muestras o materiales.' },
  logo_url: { dimensions: '800 × 300 px', ratio: '≈ 8:3', formats: 'PNG / WEBP', maxSize: '≤ 500 KB', hint: 'Fondo transparente.' },
  favicon_url: { dimensions: '32 × 32 px', ratio: '1:1', formats: 'PNG', maxSize: '≤ 100 KB', hint: 'Símbolo simple.' },
};

type Props = {
  name: keyof SiteSettings;
  value: string;
  onChange: (v: string) => void;
  file?: File;
  onFile: (f?: File) => void;
};

export function ImageField({ name, value, onChange, file, onFile }: Props) {
  const spec = SPECS[name] || { dimensions: 'Genérico', ratio: '', formats: 'JPG/PNG', maxSize: '2MB', hint: '' };
  const [notice, setNotice] = useState('');
  const localUrl = file ? URL.createObjectURL(file) : value;

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    onFile(f);
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setNotice(`✓ Imagen cargada correctamente (${img.width} × ${img.height}px)`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-950">
        <div className="flex gap-2">
          <ImageIcon size={15} className="mt-0.5 shrink-0" />
          <div>
            <b>Recomendado: {spec.dimensions} · {spec.ratio}</b>
            <div>{spec.formats} · {spec.maxSize}</div>
            <div className="mt-1 opacity-80">{spec.hint}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-lg border bg-stone-light">
          {localUrl ? <img src={localUrl} alt="Vista previa" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone"><ImageIcon /></div>}
        </div>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-xs font-bold uppercase tracking-wider hover:border-wood hover:text-wood">
            <Upload size={15} /> {file ? 'Cambiar imagen' : 'Seleccionar imagen'}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={change} />
          </label>
          <input value={value} onChange={e => onChange(e.target.value)} placeholder="O pegá la URL pública" className="w-full rounded-lg border p-2.5 text-xs" />
          {notice && <p className="text-[11px] text-emerald-700">{notice}</p>}
        </div>
      </div>
    </div>
  );
}