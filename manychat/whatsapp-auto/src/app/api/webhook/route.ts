import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import crypto from "node:crypto";
import { handleInbound } from "@/lib/inbound";
import { drainQueue } from "@/lib/drain";

// Precisa do runtime Node (crypto + service key). Nunca edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- GET: handshake de verificação do webhook ----
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Confere a assinatura HMAC-SHA256 do corpo cru com o app secret.
function assinaturaValida(raw: string, header: string | null): boolean {
  const secret = process.env.WA_APP_SECRET;
  if (!secret || !header) return false;

  const esperado =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");

  const a = Buffer.from(header);
  const b = Buffer.from(esperado);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---- POST: recebe os eventos (messages, statuses) ----
export async function POST(req: NextRequest) {
  const raw = await req.text();

  if (!assinaturaValida(raw, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Assinatura inválida", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse("JSON inválido", { status: 400 });
  }

  // Processa (enfileira as respostas) antes de responder 200.
  await handleInbound(payload);

  // Dispara o envio DEPOIS de responder — sensação de instantâneo.
  // A trava atômica da fila garante que nunca envia em dobro.
  after(async () => {
    try {
      await drainQueue();
    } catch (e: any) {
      console.error("[webhook] drain falhou:", e?.message);
    }
  });

  return NextResponse.json({ received: true });
}
