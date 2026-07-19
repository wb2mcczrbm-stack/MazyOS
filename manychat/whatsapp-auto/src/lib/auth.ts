// Autenticação simples do painel por senha única (uso interno, 1 operador).
// A senha vem de PANEL_PASSWORD; o cookie guarda o mesmo valor.
export const COOKIE = "painel_auth";

export function senhaCorreta(valor: string | undefined): boolean {
  const esperada = process.env.PANEL_PASSWORD;
  return !!esperada && valor === esperada;
}
