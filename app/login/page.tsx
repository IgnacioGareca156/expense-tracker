"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Credenciales inválidas");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // Register
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Error al registrarse");
        } else {
          // Auto-login después de registrarse
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.ok) {
            router.push("/dashboard");
            router.refresh();
          }
        }
      }
    } catch (err) {
      setError("Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl mb-6 shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
            💰
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Expense Tracker
          </h1>
          <p className="text-gray-500 font-medium">
            {isLogin ? "Bienvenido de nuevo" : "Comienza a controlar tus gastos"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                required={!isLogin}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all outline-none"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all outline-none pr-12"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 font-medium">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Procesando...</span>
              : isLogin
                ? "Iniciar Sesión"
                : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            {isLogin ? (
              <>¿No tienes cuenta? <span className="text-blue-600">Regístrate</span></>
            ) : (
              <>¿Ya tienes cuenta? <span className="text-blue-600">Inicia sesión</span></>
            )}
          </button>
        </div>

        {/* Credenciales de prueba */}
        <div className="mt-8 p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div>
            <p className="text-xs font-semibold text-gray-900 mb-1">
              Acceso rápido para probar:
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Email: <span className="font-mono text-gray-800 bg-gray-200/50 px-1 py-0.5 rounded">test@example.com</span>
              <br />
              Pass: <span className="font-mono text-gray-800 bg-gray-200/50 px-1 py-0.5 rounded">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}