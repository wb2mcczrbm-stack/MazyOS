import { login } from "../painel/actions";

// Next 16: searchParams é assíncrono.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; proximo?: string }>;
}) {
  const { erro, proximo } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <form
        action={login}
        className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-4"
      >
        <div className="text-center space-y-1">
          <div className="text-2xl">🛵</div>
          <h1 className="text-lg font-semibold text-neutral-800">
            Painel de atendimento
          </h1>
          <p className="text-sm text-neutral-500">Ultra Scooter Garage</p>
        </div>

        <input type="hidden" name="proximo" value={proximo ?? "/painel"} />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          autoFocus
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
        {erro && (
          <p className="text-sm text-red-600">Senha incorreta, tenta de novo.</p>
        )}
        <button
          type="submit"
          className="w-full bg-neutral-900 text-white rounded-lg py-2 font-medium hover:bg-neutral-800"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
