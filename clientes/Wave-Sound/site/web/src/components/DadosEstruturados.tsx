import { SITE } from "@/lib/site";

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * JSON-LD de negócio local. É o que faz o Google entender que a Wave é uma
 * empresa de serviço com endereço e telefone em São Paulo — condição pra
 * aparecer nas buscas locais e no mapa.
 */
export function DadosEstruturados() {
  const dados = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.nome,
    description: SITE.descricao,
    url,
    telephone: `+${SITE.whatsapp}`,
    email: SITE.email,
    image: `${url}/og.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.endereco.rua,
      addressLocality: SITE.endereco.cidade,
      addressRegion: SITE.endereco.uf,
      postalCode: SITE.endereco.cep,
      addressCountry: "BR",
    },
    areaServed: "São Paulo (capital e todo o estado)",
    sameAs: [SITE.instagramUrl],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD precisa ser injetado como texto; conteúdo é controlado por nós.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
