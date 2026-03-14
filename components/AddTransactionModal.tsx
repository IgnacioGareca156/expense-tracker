"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, formData.type]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?type=${formData.type}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          type: "EXPENSE",
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          categoryId: "",
        });
      } else {
        alert("Error al crear la transacción");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la transacción");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-all">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/50">
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Nueva Transacción
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Tipo de transacción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: "EXPENSE", categoryId: "" });
                }}
                className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${formData.type === "EXPENSE"
                  ? "bg-white text-red-600 shadow-[0_2px_10px_rgb(0,0,0,0.06)] scale-[1.02]"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                📉 Gasto
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: "INCOME", categoryId: "" });
                }}
                className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${formData.type === "INCOME"
                  ? "bg-white text-green-600 shadow-[0_2px_10px_rgb(0,0,0,0.06)] scale-[1.02]"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                📈 Ingreso
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold text-lg">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full pl-9 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-bold text-lg placeholder:text-gray-400 placeholder:font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <div className="relative">
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium appearance-none"
              >
                <option value="" disabled>Selecciona una categoría</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="Ej: Almuerzo con amigos"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100/80">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Guardando..." : "Guardar Movimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}