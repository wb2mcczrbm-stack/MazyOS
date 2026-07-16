import { redirect } from "next/navigation";

/**
 * `/admin` é o que o vendedor digita e o que o README manda abrir. Sem essa rota
 * ele cai num 404 — o middleware só o redireciona quando está DESLOGADO.
 */
export default function AdminIndex() {
  redirect("/admin/motos");
}
