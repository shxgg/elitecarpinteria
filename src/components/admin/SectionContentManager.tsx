import { FormEvent, useEffect, useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { supabase } from '../../supabase';

type Props = {
  products: any[];
  onDataChanged: () => void;
};

export function SectionContentManager({ products, onDataChanged }: Props) {
  // Testimonios
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Pasos de Proceso
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [stepNum, setStepNum] = useState('');
  const [stepTitle, setStepTitle] = useState('');
  const [stepDesc, setStepDesc] = useState('');

  const loadData = async () => {
    const { data: testData } = await supabase.from('testimonials').select('*').order('created_at', { ascending: true });
    if (testData) setTestimonials(testData);

    const { data: stepData } = await supabase.from('process_steps').select('*').order('order_index', { ascending: true });
    if (stepData) setProcessSteps(stepData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar Testimonio
  const handleAddTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    if (!newQuote || !newAuthor) return;

    const { error } = await supabase.from('testimonials').insert([{
      quote: newQuote,
      author: newAuthor,
      location: newLocation
    }]);

    if (!error) {
      setNewQuote('');
      setNewAuthor('');
      setNewLocation('');
      loadData();
      onDataChanged();
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('¿Eliminar esta opinión?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    loadData();
    onDataChanged();
  };

  // Agregar Paso
  const handleAddStep = async (e: FormEvent) => {
    e.preventDefault();
    if (!stepTitle || !stepDesc) return;

    const { error } = await supabase.from('process_steps').insert([{
      step_number: stepNum || `0${processSteps.length + 1}`,
      title: stepTitle,
      description: stepDesc,
      order_index: processSteps.length + 1
    }]);

    if (!error) {
      setStepNum('');
      setStepTitle('');
      setStepDesc('');
      loadData();
      onDataChanged();
    }
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm('¿Eliminar este paso del proceso?')) return;
    await supabase.from('process_steps').delete().eq('id', id);
    loadData();
    onDataChanged();
  };

  // Marcar/Desmarcar mueble como destacado
  const toggleFeatured = async (product: any) => {
    const nextState = !product.is_featured;
    await supabase.from('products').update({ is_featured: nextState }).eq('id', product.id);
    onDataChanged();
  };

  return (
    <div className="space-y-8">
      {/* 1. Muebles Destacados */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-wood">Muebles Destacados en la Home</h3>
        <p className="text-xs text-stone">Hacé clic en la estrella para destacar o quitar un producto de la página principal.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((prod) => (
            <div key={prod.id} className="flex items-center justify-between border bg-white p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={prod.image || prod.image_url} alt="" className="h-10 w-10 object-cover rounded" />
                <div>
                  <p className="text-xs font-bold">{prod.name || prod.title}</p>
                  <p className="text-[10px] text-stone">{prod.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFeatured(prod)}
                className={`p-2 rounded-full border ${prod.is_featured ? 'bg-amber-100 border-amber-400 text-amber-600' : 'bg-gray-50 text-gray-400'}`}
                title={prod.is_featured ? 'Destacado' : 'Marcar como destacado'}
              >
                <Star size={16} fill={prod.is_featured ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-charcoal/10" />

      {/* 2. Cómo Trabajamos */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-wood">Pasos de "Cómo trabajamos"</h3>
        <form onSubmit={handleAddStep} className="grid gap-3 bg-bone/50 p-4 rounded-lg border sm:grid-cols-3">
          <input
            placeholder="Nº (ej. 01)"
            value={stepNum}
            onChange={(e) => setStepNum(e.target.value)}
            className="border p-2 rounded text-xs bg-white"
          />
          <input
            placeholder="Título del paso"
            value={stepTitle}
            onChange={(e) => setStepTitle(e.target.value)}
            className="border p-2 rounded text-xs bg-white sm:col-span-2"
            required
          />
          <textarea
            placeholder="Descripción detallada del paso"
            value={stepDesc}
            onChange={(e) => setStepDesc(e.target.value)}
            className="border p-2 rounded text-xs bg-white sm:col-span-3"
            rows={2}
            required
          />
          <button type="submit" className="sm:col-span-3 bg-charcoal text-white py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-1">
            <Plus size={14} /> Agregar Paso
          </button>
        </form>

        <div className="space-y-2">
          {processSteps.map((step) => (
            <div key={step.id} className="flex items-center justify-between border bg-white p-3 rounded">
              <div>
                <span className="text-xs font-bold text-wood mr-2">{step.step_number}</span>
                <span className="text-xs font-bold">{step.title}</span>
                <p className="text-[11px] text-stone mt-0.5">{step.description}</p>
              </div>
              <button onClick={() => handleDeleteStep(step.id)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-charcoal/10" />

      {/* 3. Opiniones / Testimonios */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-wood">Opiniones y Testimonios</h3>
        <form onSubmit={handleAddTestimonial} className="grid gap-3 bg-bone/50 p-4 rounded-lg border sm:grid-cols-2">
          <textarea
            placeholder="Opinión o cita del cliente..."
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            className="border p-2 rounded text-xs bg-white sm:col-span-2"
            rows={2}
            required
          />
          <input
            placeholder="Nombre del cliente (ej. Lucía M.)"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            className="border p-2 rounded text-xs bg-white"
            required
          />
          <input
            placeholder="Ubicación (ej. Colegiales)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="border p-2 rounded text-xs bg-white"
          />
          <button type="submit" className="sm:col-span-2 bg-charcoal text-white py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-1">
            <Plus size={14} /> Agregar Opinión
          </button>
        </form>

        <div className="space-y-2">
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-center justify-between border bg-white p-3 rounded">
              <div>
                <p className="text-xs italic">“{t.quote}”</p>
                <p className="text-[10px] font-bold text-stone mt-1">{t.author} {t.location ? `· ${t.location}` : ''}</p>
              </div>
              <button onClick={() => handleDeleteTestimonial(t.id)} className="text-red-500 hover:text-red-700 p-1 shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}