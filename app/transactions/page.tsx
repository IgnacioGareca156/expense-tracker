"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: "INCOME" | "EXPENSE";
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  category?: Category;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });
  const [filter, setFilter] = useState({
    type: "ALL" as "ALL" | "INCOME" | "EXPENSE",
    search: "",
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTransactions();
      fetchCategories();
    }
  }, [status]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : "/api/transactions";

      const method = editingTransaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        fetchTransactions();
        closeModal();
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
  };

  const executeDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await fetch(`/api/transactions/${transactionToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTransactions();
        setTransactionToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split("T")[0],
        categoryId: transaction.category?.id || "",
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        amount: "",
        description: "",
        type: "EXPENSE",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filter.type === "ALL" || t.type === filter.type;
    const matchesSearch =
      t.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(filter.search.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Cálculo de paginación
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const availableCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm animate-pulse">Cargando transacciones...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transacciones</h1>
              <p className="text-gray-500 font-medium mt-1">Gestiona tus ingresos y gastos</p>
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
              Nueva Transacción
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar por descripción o categoría..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo filtro
                </label>
                <div className="relative">
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="ALL">Todos los movimientos</option>
                    <option value="INCOME">Solo Ingresos</option>
                    <option value="EXPENSE">Solo Gastos</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de transacciones */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <span className="text-3xl">📭</span>
                </div>
                <p className="text-gray-900 font-bold text-lg mb-1">No hay transacciones</p>
                <p className="text-gray-500 font-medium">Agrega tu primera transacción para comenzar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Vista Mobile (Tarjetas) */}
                <div className="block md:hidden divide-y divide-gray-100/80">
                  {paginatedTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-5 hover:bg-gray-50/80 flex flex-col gap-4 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                            style={{ backgroundColor: (transaction.category?.color || "#gray") + "20" }}
                          >
                            {transaction.category?.icon || "💰"}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{transaction.category?.name || "Sin categoría"}</p>
                            <p className="text-sm font-medium text-gray-500 line-clamp-1">{transaction.description || "Sin descripción"}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span
                            className={`text-lg font-bold block ${transaction.type === "INCOME"
                              ? "text-green-600"
                              : "text-gray-900"
                              }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}$
                            {Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(transaction.date).toLocaleDateString("es")}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100/80">
                        <button
                          onClick={() => openModal(transaction)}
                          className="text-sm text-blue-700 hover:text-blue-900 font-semibold px-4 py-2 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-sm text-red-700 hover:text-red-900 font-semibold px-4 py-2 bg-red-50/80 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vista Desktop (Tabla) */}
                <table className="w-full hidden md:table">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-100/50">
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                          {new Date(transaction.date).toLocaleDateString("es", {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                              style={{ backgroundColor: transaction.category?.color + "20" }}
                            >
                              {transaction.category?.icon || "💰"}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {transaction.category?.name || "Sin categoría"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600">
                          {transaction.description || "—"}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${transaction.type === "INCOME"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {transaction.type === "INCOME" ? "Ingreso" : "Gasto"}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <span
                            className={`text-lg font-bold px-2 py-1 rounded-md ${transaction.type === "INCOME"
                              ? "text-green-700 bg-green-50/50"
                              : "text-gray-900"
                              }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}$
                            {Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openModal(transaction)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/50 backdrop-blur-xl px-4 py-4 border-t border-gray-100/50 sm:px-6 rounded-b-3xl mt-0">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Mostrando del <span className="font-bold text-gray-900">{startIndex + 1}</span> al{" "}
                    <span className="font-bold text-gray-900">
                      {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-bold text-gray-900">{filteredTransactions.length}</span>{" "}
                    resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm transition-colors ${currentPage === page
                          ? "z-10 bg-gray-900 font-bold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                          : "font-semibold text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/50">
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-5 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                {editingTransaction ? "Editar Transacción" : "Nueva Transacción"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium appearance-none"
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100/80">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5"
                >
                  {editingTransaction ? "Actualizar Movimiento" : "Guardar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Transacción?</h3>
            <p className="text-gray-500 mb-6">Esta acción no se puede deshacer. Los datos serán borrados permanentemente.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}