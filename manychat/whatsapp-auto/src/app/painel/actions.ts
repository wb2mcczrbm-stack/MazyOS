"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, senhaCorreta } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { textPayload } from "@/lib/wa";
import { drainQueue } from "@/lib/drain";

// ---- Login / logout ----
export async function login(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const proximo = String(formData.get("proximo") ?? "/painel");
  if (!senhaCorreta(senha)) {
    redirect("/login?erro=1");
  }
  const jar = await cookies();
  jar.set(COOKIE, senha, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(proximo.startsWith("/painel") ? proximo : "/painel");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/login");
}

// ---- Config da conta WhatsApp ----
export async function salvarConfig(formData: FormData) {
  const patch: Record<string, string> = {};
  for (const campo of [
    "access_token",
    "phone_number_id",
    "waba_id",
    "display_phone_number",
    "verified_name",
    "notify_wa_id",
  ]) {
    const v = formData.get(campo);
    if (v != null) patch[campo] = String(v).trim();
  }
  await db
    .from("config")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
  revalidatePath("/painel/config");
}

// ---- Atendimento humano: responder o cliente pelo mesmo número ----
export async function responderCliente(formData: FormData) {
  const waId = String(formData.get("wa_id") ?? "");
  const texto = String(formData.get("texto") ?? "").trim();
  if (!waId || !texto) return;

  // Marca a conversa como humana (o bot para de responder).
  await db.from("contacts").update({ handed_off: true }).eq("wa_id", waId);

  // Enfileira a mensagem e registra no histórico.
  await db.from("queue").insert({
    wa_id: waId,
    payload: textPayload(waId, texto),
    status: "pending",
    send_after: new Date().toISOString(),
  });
  await db.from("messages").insert({
    wa_id: waId,
    direction: "out",
    author: "human",
    body: texto,
  });

  // Envia agora.
  try {
    await drainQueue();
  } catch (e: any) {
    console.error("[painel] envio falhou:", e?.message);
  }
  revalidatePath(`/painel/${waId}`);
}

// ---- Devolver a conversa pro bot ----
export async function devolverAoBot(formData: FormData) {
  const waId = String(formData.get("wa_id") ?? "");
  if (!waId) return;
  await db
    .from("contacts")
    .update({ handed_off: false, current_node: null })
    .eq("wa_id", waId);
  revalidatePath(`/painel/${waId}`);
}
