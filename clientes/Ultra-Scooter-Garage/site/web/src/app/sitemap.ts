import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/publico";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  // Motos vendidas continuam no sitemap de propósito: a página segue rankeando e
  // atrai quem procura o mesmo modelo. Sai da vitrine, não sai do Google.
  const { data } = await supabase
    .from("motos")
    .select("slug, atualizado_em")
    .is("apagada_em", null)
    .order("criado_em", { ascending: false });

  const fichas = (data ?? []).map((m) => ({
    url: `${SITE}/motos/${m.slug}`,
    lastModified: new Date(m.atualizado_em as string),
    priority: 0.8,
  }));

  return [
    { url: SITE, lastModified: new Date(), priority: 1 },
    { url: `${SITE}/motos`, lastModified: new Date(), priority: 0.9 },
    ...fichas,
  ];
}
