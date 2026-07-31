"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AuthShell, primaryButtonClass } from "@/components/ui/auth-shell";

export default function VerificarEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => (r.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <AuthShell
      title={status === "ok" ? "E-mail confirmado" : status === "error" ? "Link inválido" : "Verificando..."}
      subtitle={
        status === "ok"
          ? "Sua conta está ativa."
          : status === "error"
          ? "Este link expirou ou já foi utilizado."
          : undefined
      }
    >
      {status !== "loading" && (
        <Link href="/entrar" className={`${primaryButtonClass} block text-center`}>
          Ir para o login
        </Link>
      )}
    </AuthShell>
  );
}
