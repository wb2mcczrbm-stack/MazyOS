import { NextRequest, NextResponse } from "next/server";
import { drainQueue } from "@/lib/drain";

// Endpoint que o pg_cron do Supabase chama a cada minuto pra drenar a fila
// (a Vercel Hobby não tem cron de minuto). Protegido por um segredo simples.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  const url = req.nextUrl.searchParams.get("secret");
  return auth === `Bearer ${secret}` || url === secret;
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) {
    return new NextResponse("Não autorizado", { status: 401 });
  }
  const enviados = await drainQueue(50);
  return NextResponse.json({ ok: true, enviados });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
