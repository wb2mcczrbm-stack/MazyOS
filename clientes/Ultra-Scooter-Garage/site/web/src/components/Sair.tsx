"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Sair() {
  const router = useRouter();

  async function sair() {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh(); // limpa o cache do App Router — senão a lista fica na tela
  }

  return (
    <button
      onClick={sair}
      className="text-sm text-neutral-500 transition hover:text-neutral-900"
    >
      Sair
    </button>
  );
}
