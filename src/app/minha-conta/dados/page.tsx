"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { inputClass, primaryButtonClass } from "@/components/ui/auth-shell";

export default function DadosPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        setName(data.user?.name ?? "");
        setPhone(data.user?.phone ?? "");
        setEmail(data.user?.email ?? "");
      });
  }, []);

  async function saveProfile() {
    setSavedMsg("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setSavedMsg(res.ok ? "Dados atualizados." : "Erro ao atualizar dados.");
  }

  async function changePassword() {
    setPasswordMsg("");
    setPasswordError("");
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPasswordError(data.error);
      return;
    }
    setPasswordMsg("Senha alterada com sucesso.");
    setCurrentPassword("");
    setNewPassword("");
  }

  async function deleteAccount() {
    await fetch("/api/account/delete", { method: "POST" });
    await signOut({ callbackUrl: "/" });
    router.push("/");
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-3xl tracking-wide mb-6">Meus dados</h1>
        <div className="space-y-3 max-w-md">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className={inputClass} />
          <input value={email} disabled placeholder="E-mail" className={`${inputClass} opacity-50`} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" className={inputClass} />
          {savedMsg && <p className="text-xs text-furikai-white">{savedMsg}</p>}
          <button onClick={saveProfile} className={`${primaryButtonClass} max-w-xs`}>
            Salvar dados
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl tracking-wide mb-4">Alterar senha</h2>
        <div className="space-y-3 max-w-md">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Senha atual"
            className={inputClass}
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha"
            className={inputClass}
          />
          {passwordError && <p className="text-xs text-furikai-red-bright">{passwordError}</p>}
          {passwordMsg && <p className="text-xs text-furikai-white">{passwordMsg}</p>}
          <button onClick={changePassword} className={`${primaryButtonClass} max-w-xs`}>
            Alterar senha
          </button>
        </div>
      </div>

      <div className="border border-furikai-red-bright/50 p-5 max-w-md">
        <h2 className="font-display text-xl tracking-wide mb-2 text-furikai-red-bright">Excluir conta</h2>
        <p className="text-xs text-furikai-gray-400 mb-4">
          Essa ação anonimiza seus dados pessoais e desativa seu acesso. Não é possível desfazer.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-5 py-2 border border-furikai-red-bright text-furikai-red-bright text-sm uppercase tracking-wide hover:bg-furikai-red-bright hover:text-white transition-colors"
          >
            Quero excluir minha conta
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={deleteAccount}
              className="px-5 py-2 bg-furikai-red-bright text-sm uppercase tracking-wide hover:bg-furikai-red transition-colors"
            >
              Confirmar exclusão
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-5 py-2 border border-furikai-gray-700 text-sm uppercase tracking-wide"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
