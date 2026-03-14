"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import AddTransactionModal from "@/components/AddTransactionModal";
import Navbar from "@/components/Navbar";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTransactions();
    }
  }, [status, selectedMonth, selectedYear]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/transactions", window.location.origin);
      if (selectedMonth !== 0) {
        url.searchParams.append("month", selectedMonth.toString());
      }
      url.searchParams.append("year", selectedYear.toString());

      const response = await fetch(url.toString());
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

  // Calcular métricas
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Datos para gráfico de gastos por categoría
  const expensesByCategory = transactions
    .filter((t) => t.type === "EXPENSE" && t.category)
    .reduce((acc, t) => {
      const categoryName = t.category!.name;
      const color = t.category!.color;

      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color };
      }
      acc[categoryName].value += Number(t.amount);
      return acc;
    }, {} as Record<string, CategoryData>);

  const chartData = Object.values(expensesByCategory);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm animate-pulse">Cargando tu información...</p>
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
          <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Resumen Financiero</h1>
              <p className="text-gray-500 mt-1 font-medium">Controla tus ingresos y gastos de un vistazo</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5"
              >
                <div className="bg-white/20 p-1 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                Nueva Transacción
              </button>
              <div className="flex bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] rounded-xl border border-gray-100 p-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-4 py-2 border rounded-lg bg-white text-black"
                >
                  <option value={0}>Todo el Año</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleString("es", { month: "long" })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 border rounded-lg bg-white text-black"
                >
                  {Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => 2020 + i)
                    .reverse()
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 font-semibold bg-gray-100/80 px-3 py-1 rounded-lg text-sm">Ingresos</p>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 font-semibold bg-gray-100/80 px-3 py-1 rounded-lg text-sm">Gastos</p>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 19h-5.5a3.5 3.5 0 0 1 0-7h5a3.5 3.5 0 0 0 0-7H6" /></svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`overflow-hidden relative bg-gradient-to-br ${balance >= 0 ? "from-gray-900 to-gray-800" : "from-red-900 to-red-800"} p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800`}>
              {/* Decorative background shape */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-300 font-semibold bg-white/10 px-3 py-1 rounded-lg text-sm">Balance Total</p>
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Gráfico de torta */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Distribución de Gastos</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData as any}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `$${entry.value.toFixed(0)}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">Sin datos en este período</p>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Registra tu primer gasto para ver cómo se distribuye tu dinero.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar gasto
                  </button>
                </div>
              )}
            </div>

            {/* Gráfico de barras */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Análisis Comparativo</h2>
              {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Ingresos", value: totalIncome, fill: "#10B981" },
                      { name: "Gastos", value: totalExpenses, fill: "#EF4444" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">Sin ingresos ni gastos</p>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Añade transacciones para poder comparar cómo te está yendo financieramente.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de transacciones recientes */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Movimientos Recientes</h2>
            </div>
            {transactions.length > 0 ? (
              <div className="divide-y divide-gray-100/80">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-6 hover:bg-gray-50/80 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                        style={{ backgroundColor: (transaction.category?.color || "#e5e7eb") + "30" }}
                      >
                        {transaction.category?.icon || "💰"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.category?.name || "Sin categoría"}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{transaction.description || "Sin descripción"}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.date).toLocaleDateString("es")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-lg font-bold shrink-0 ml-4 px-3 py-1 rounded-lg ${transaction.type === "INCOME" ? "text-green-700 bg-green-50" : "text-gray-900"
                        }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      ${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-5 border border-blue-100">
                  <span className="text-3xl">📝</span>
                </div>
                <p className="text-gray-900 font-bold mb-2">Aún no hay movimientos</p>
                <p className="text-gray-500 font-medium max-w-sm mb-8">
                  Lleva el control de tu dinero sumando tus primeros ingresos o gastos.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-all font-semibold shadow-lg shadow-gray-900/20 transform hover:-translate-y-0.5"
                >
                  Empezar ahora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTransactions}
        />
      </div>
    </div>
  );
}