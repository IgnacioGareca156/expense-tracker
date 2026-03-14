"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">💰</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Expense Tracker
              </h1>
              <p className="text-xs text-gray-500">
                Administra tus finanzas
              </p>
            </div>
          </div>

          {/* Links de navegación (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push("/dashboard")}
              className={`font-semibold transition-all duration-300 ${pathname === "/dashboard"
                ? "text-blue-600 drop-shadow-sm scale-105"
                : "text-gray-500 hover:text-gray-900 hover:scale-105"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/transactions")}
              className={`font-semibold transition-all duration-300 ${pathname === "/transactions"
                ? "text-blue-600 drop-shadow-sm scale-105"
                : "text-gray-500 hover:text-gray-900 hover:scale-105"
                }`}
            >
              Transacciones
            </button>
            <button
              onClick={() => router.push("/categories")}
              className={`font-semibold transition-all duration-300 ${pathname === "/categories"
                ? "text-blue-600 drop-shadow-sm scale-105"
                : "text-gray-500 hover:text-gray-900 hover:scale-105"
                }`}
            >
              Categorías
            </button>
          </div>

          {/* Usuario y logout */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user.email}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Botón de logout (desktop) */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all font-semibold hover:shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Salir
            </button>

            {/* Menú hamburguesa (mobile) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-3">
            {session?.user && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                router.push("/dashboard");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${pathname === "/dashboard"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                router.push("/transactions");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${pathname === "/transactions"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Transacciones
            </button>
            <button
              onClick={() => {
                router.push("/categories");
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${pathname === "/categories"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Categorías
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Salir
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}