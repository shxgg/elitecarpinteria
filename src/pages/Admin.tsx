import React, { useState } from 'react';
import { supabase } from '../supabase';

export const Admin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Formulario para cargar nuevo mueble
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Amoblamientos de cocina');
  const [file, setFile] = useState<File | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Error: ' + error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Por favor seleccioná una imagen');

    setLoading(true);
    // 1. Subir la foto a Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error subiendo foto: ' + uploadError.message);
      setLoading(false);
      return;
    }

    // 2. Obtener URL pública de la foto
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // 3. Guardar el mueble en la tabla
    const { error: insertError } = await supabase.from('products').insert([
      {
        title,
        description,
        category,
        image_url: urlData.publicUrl,
      },
    ]);

    if (insertError) alert('Error guardando producto: ' + insertError.message);
    else {
      alert('¡Producto cargado exitosamente!');
      setTitle('');
      setDescription('');
      setFile(null);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-center">Acceso Administrador</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cargar Nuevo Mueble</h2>
      <form onSubmit={handleUploadProduct} className="space-y-4">
        <input
          type="text"
          placeholder="Título del mueble"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Amoblamientos de cocina">Amoblamientos de cocina</option>
          <option value="Revestimientos">Revestimientos</option>
          <option value="Placards">Placards</option>
          <option value="Muebles a medida">Muebles a medida</option>
        </select>
        <input
          type="file"
          accept="image/*"
          className="w-full border p-2 rounded"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
          {loading ? 'Subiendo...' : 'Guardar Mueble'}
        </button>
      </form>
    </div>
  );
};
