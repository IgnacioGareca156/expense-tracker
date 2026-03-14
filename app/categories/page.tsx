"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
}

const PRESET_COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#6B7280", "#14B8A6", "#F97316",
];

const PRESET_ICONS = [
  "🍔", "🚗", "🎮", "💡", "🏥", "📚", "💰", "💼", "📈", "💵",
  "🏠", "✈️", "🎬", "🛒", "☕", "🎨", "💪", "📱", "🎓", "🎁",
];

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    color: "#3B82F6",
    icon: "📦",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    }
  }, [status]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCategories();
        closeModal();
      } else {
        const data = await response.json();
        alert(data.error || "Error al guardar la categoría");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error al guardar la categoría");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la categoría");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error al eliminar la categoría");
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        type: "EXPENSE",
        color: "#3B82F6",
        icon: "📦",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setShowColorPicker(false);
    setShowIconPicker(false);
  };

  const expenseCategories = categories.filter((cat) => cat.type === "EXPENSE");
  const incomeCategories = categories.filter((cat) => cat.type === "INCOME");

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm animate-pulse">Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Categorías</h1>
              <p className="text-gray-500 font-medium mt-1">Gestiona tus clasificaciones de ingresos y gastos</p>
            </div>
            <button
              onClick={() => openModal()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5"
            >
              <div className="bg-white/20 p-1 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Nueva Categoría
            </button>
          </div>

          {/* Categorías de Gastos */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
              </span>
              Gastos
              <span className="text-sm font-semibold bg-gray-200/60 text-gray-600 px-2.5 py-0.5 rounded-lg ml-2">
                {expenseCategories.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all border border-gray-100/50 group"
                  style={{ borderTop: `4px solid ${category.color}` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                        style={{ backgroundColor: category.color + "15" }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1 bg-gray-50 px-2 pl-1.5 py-1 rounded-md max-w-fit border border-gray-100">
                          <div
                            className="w-3.5 h-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-xs font-mono font-medium text-gray-600 uppercase pt-0.5 tracking-wider">{category.color}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(category)}
                      className="flex-1 px-4 py-2 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-semibold border border-blue-100/50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 px-4 py-2 bg-red-50/80 hover:bg-red-100 text-red-700 rounded-xl transition-colors text-sm font-semibold border border-red-100/50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 border-dashed">
                  <p className="text-gray-500 font-medium">Aún no hay categorías de gastos</p>
                </div>
              )}
            </div>
          </div>

          {/* Categorías de Ingresos */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </span>
              Ingresos
              <span className="text-sm font-semibold bg-gray-200/60 text-gray-600 px-2.5 py-0.5 rounded-lg ml-2">
                {incomeCategories.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all border border-gray-100/50 group"
                  style={{ borderTop: `4px solid ${category.color}` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                        style={{ backgroundColor: category.color + "15" }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1 bg-gray-50 px-2 pl-1.5 py-1 rounded-md max-w-fit border border-gray-100">
                          <div
                            className="w-3.5 h-3.5 rounded-full shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-xs font-mono font-medium text-gray-600 uppercase pt-0.5 tracking-wider">{category.color}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(category)}
                      className="flex-1 px-4 py-2 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-semibold border border-blue-100/50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 px-4 py-2 bg-red-50/80 hover:bg-red-100 text-red-700 rounded-xl transition-colors text-sm font-semibold border border-red-100/50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 border-dashed">
                  <p className="text-gray-500 font-medium">Aún no hay categorías de ingresos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/50">
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-5 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  setFormData({ name: "", type: "EXPENSE", color: "#3B82F6", icon: "📌" });
                }}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Categoría
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!!editingCategory}
                  >
                    <option value="EXPENSE">📉 Gasto</option>
                    <option value="INCOME">📈 Ingreso</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {editingCategory && (
                  <p className="text-xs text-gray-400 mt-2 font-medium ml-1">
                    * No se puede cambiar el tipo de una categoría existente
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                  placeholder="Ej: Comida, Transporte..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ícono y Color
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIconPicker(!showIconPicker);
                      setShowColorPicker(false);
                    }}
                    className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-2xl hover:border-blue-500 hover:shadow-sm transition-all"
                  >
                    {formData.icon}
                  </button>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="Emoji o texto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowIconPicker(false);
                    }}
                    className="w-14 h-14 rounded-xl border border-gray-200 transition-all hover:scale-105 shadow-sm"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                {showIconPicker && (
                  <div className="mt-3 p-4 border border-gray-200/60 rounded-xl bg-gray-50/80 grid grid-cols-8 gap-2 overflow-y-auto max-h-48 shadow-inner">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, icon });
                          setShowIconPicker(false);
                        }}
                        className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white rounded-lg transition-all hover:scale-110 shadow-sm"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}

                {showColorPicker && (
                  <div className="mt-3 p-4 border border-gray-200/60 rounded-xl bg-gray-50/80 grid grid-cols-6 gap-3 shadow-inner">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, color });
                          setShowColorPicker(false);
                        }}
                        className="w-10 h-10 rounded-full hover:scale-110 transition-transform shadow-sm border-2 border-white ring-1 ring-black/5"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Vista previa de la Categoría</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-black/5"
                    style={{ backgroundColor: formData.color + "20" }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{formData.name || "Nombre"}</p>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.color }}></span>
                      {formData.color}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: "", type: "EXPENSE", color: "#3B82F6", icon: "📌" });
                  }}
                  className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5"
                >
                  {editingCategory ? "Actualizar Categoría" : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}