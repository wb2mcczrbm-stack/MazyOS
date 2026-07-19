// Saudação por horário de Brasília (America/Sao_Paulo), independente do
// fuso do servidor (a Vercel roda em UTC). Usamos Intl pra pegar a hora
// local certa sem biblioteca externa.
export function saudacao(now: Date = new Date()): string {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );

  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

// Troca os curingas de um texto do fluxo pelos valores em runtime.
// {saudacao} -> Bom dia/tarde/noite; {modelo} -> o que o cliente escolheu; etc.
export function preencher(
  texto: string,
  vars: Record<string, string | undefined> = {},
): string {
  const base: Record<string, string | undefined> = {
    saudacao: saudacao(),
    ...vars,
  };
  return texto.replace(/\{(\w+)\}/g, (m, chave) =>
    base[chave] != null ? String(base[chave]) : m,
  );
}
