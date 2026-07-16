import Link from "next/link";
import { Sair } from "@/components/Sair";

/** Navegação do painel. Só aparece pra quem já entrou — o login fica de fora. */
export default function InternoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/admin/motos" className="font-bold tracking-tight">
            Estoque
          </Link>
          <Link href="/admin/leads" className="text-neutral-500 hover:text-neutral-900">
            Motos oferecidas
          </Link>
          <Link href="/admin/lixeira" className="text-neutral-500 hover:text-neutral-900">
            Lixeira
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Sair />
          <Link
            href="/admin/motos/nova"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            + Nova moto
          </Link>
        </div>
      </div>

      {children}
    </>
  );
}
