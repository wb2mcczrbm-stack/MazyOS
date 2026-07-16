import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieParaGravar = { name: string; value: string; options: CookieOptions };

/**
 * Faz duas coisas:
 * 1. Refresca o token de sessão do Supabase (senão o vendedor é deslogado no meio
 *    de um cadastro, e perde as fotos que já subiu).
 * 2. Barra /admin pra quem não está logado.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieParaGravar[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() e não getSession(): getSession lê o cookie sem validar, e o cookie
  // é falsificável. Aqui a validação é o ponto.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const ehAdmin = pathname.startsWith("/admin");
  const ehLogin = pathname === "/admin/login";

  /**
   * Um redirect novo NÃO herda os cookies que o setAll escreveu em `response`.
   * Se o getUser() acabou de rotacionar o refresh token, o token antigo já foi
   * consumido no servidor — jogar fora o novo desloga o vendedor no meio do
   * trabalho. Transplantar os cookies é obrigatório, não zelo.
   */
  const redirecionar = (destino: string) => {
    const url = request.nextUrl.clone();
    url.pathname = destino;
    const redir = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redir.cookies.set(c));
    return redir;
  };

  if (ehAdmin && !ehLogin && !user) return redirecionar("/admin/login");
  if (ehLogin && user) return redirecionar("/admin/motos");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
