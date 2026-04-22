"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { UserFavorite } from "@/lib/types";

export default function FavoritPage() {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/user/favorit');
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    if (!confirm('Hapus dari favorit?')) return;
    
    try {
      const res = await fetch(/api/user/favorit/ + id, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B9AD]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Makanan Favorit</h1>
          <p className="text-slate-500 mt-1">Daftar makanan yang Anda simpan sebagai favorit</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Favorit</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Anda belum menambahkan makanan ke daftar favorit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav, index) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{fav.makanan?.nama}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full mt-1 inline-block">
                    {fav.makanan?.kategori?.nama || 'Tanpa Kategori'}
                  </span>
                </div>
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Hapus dari favorit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {fav.makanan?.porsi?.[0]?.energi || 0} kkal / {fav.makanan?.porsi?.[0]?.nama_porsi || 'porsi'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
