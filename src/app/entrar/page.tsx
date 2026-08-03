"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell, inputClass, primaryButtonClass } from "@/components/ui/auth-shell";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF"]);

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const explicitCallbackUrl = params.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    // Se o usuário chegou aqui redirecionado de uma rota protegida (ex.:
    // /admin/pedidos ou /checkout), volta pra lá. Senão, manda cada papel
    // pro lugar que faz sentido: admin/staff pro painel, cliente pra loja.
    if (explicitCallbackUrl) {
      router.push(explicitCallbackUrl);
    } else {
      const session = await getSession();
      const role = session?.user?.role;
      router.push(role && ADMIN_ROLES.has(role) ? "/admin" : "/produtos");
    }
    router.refresh();
  }

  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta Furikai">
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-xs text-furikai-red-bright">{error}</p>}
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="flex justify-between text-xs text-furikai-gray-400 mt-4">
        <Link href="/recuperar-senha" className="hover:text-furikai-white">
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" className="hover:text-furikai-white">
          Criar conta
        </Link>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
