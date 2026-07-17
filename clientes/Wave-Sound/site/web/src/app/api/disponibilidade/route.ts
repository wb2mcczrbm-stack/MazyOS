import { NextResponse } from "next/server";
import { datasOcupadas, calendarioConfigurado } from "@/lib/google-calendar";

// google-auth-library precisa do runtime Node (não Edge). Sempre dinâmica: a
// agenda muda, não dá pra cachear no build.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/disponibilidade?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
 * → { ocupadas: string[], configurado: boolean }
 *
 * Nunca derruba o front: qualquer erro vira "nada ocupado" (todas as datas
 * livres) com status 200. O erro é logado no servidor pra diagnóstico.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inicioStr = searchParams.get("inicio");
  const fimStr = searchParams.get("fim");

  const inicio = inicioStr ? new Date(inicioStr) : new Date();
  const fim = fimStr
    ? new Date(fimStr)
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 180); // ~6 meses à frente

  try {
    const ocupadas = await datasOcupadas(inicio, fim);
    return NextResponse.json(
      { ocupadas, configurado: calendarioConfigurado() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[disponibilidade] falha ao ler a agenda:", e);
    return NextResponse.json(
      { ocupadas: [], configurado: calendarioConfigurado(), erro: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
