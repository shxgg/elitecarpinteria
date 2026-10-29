import { FormEvent, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';

type Props = {
  products: any[];
  categories: string[];
  onProductChanged: () => void;
};

export function ProductManager({ products, categories, onProductChanged }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Amoblamientos de cocina');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Seleccioná una imagen para el producto');
    setLoading(true);

    try {
      const fileName = `prod-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      
      const { error: insertError } = await supabase.from('products').insert([
        {
          title,
          description,
          price: price ? parseFloat(price) : 0,
          category,
          image_url: urlData.publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      alert('¡Mueble agregado con éxito!');
      setTitle('');
      setDescription('');
      setPrice('');
      setFile(null);
      setPreviewUrl('');
      onProductChanged();
    } catch (err: any) {
      alert('Error al guardar el producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este mueble?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else onProductChanged();
  };

  return (
    <div className="space-y-6">
      {/* Formulario para agregar producto */}
      <form onSubmit={handleUpload} className="space-y-4 rounded-xl border border-charcoal/10 bg-bone/50 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-wood">Agregar Nuevo Mueble / Producto</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre del mueble"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border bg-white p-3 text-sm"
            required
          />
          <input
            type="number"
            placeholder="Precio en ARS (ej: 150000)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border bg-white p-3 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border bg-white p-3 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded-lg border bg-white p-2.5 text-xs"
            required
          />
        </div>
        <textarea
          placeholder="Descripción detallada del mueble..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border bg-white p-3 text-sm"
          required
        />
        {previewUrl && (
          <div className="w-24 h-24 rounded border overflow-hidden">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-charcoal px-5 py-3 text-xs font-bold uppercase text-white hover:bg-wood"
        >
          <Plus size={16} /> {loading ? 'Subiendo...' : 'Publicar Mueble'}
        </button>
      </form>

      {/* Listado de productos cargados */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone">Muebles Registrados ({products.length})</h3>
        <div className="divide-y rounded-xl border bg-white">
          {products.length === 0 ? (
            <p className="p-6 text-center text-xs text-stone">No hay muebles cargados en la base de datos.</p>
          ) : (
            products.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <img src={prod.image || prod.image_url} alt={prod.name || prod.title} className="h-12 w-12 rounded object-cover border" />
                  <div>
                    <h4 className="text-sm font-bold">{prod.name || prod.title}</h4>
                    <p className="text-xs text-wood font-semibold">{prod.category} · ${prod.price ? prod.price.toLocaleString('es-AR') : 'A consultar'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  title="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}