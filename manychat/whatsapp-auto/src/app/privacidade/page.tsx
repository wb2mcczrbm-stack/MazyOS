export const metadata = { title: "Política de Privacidade — Ultra Scooter Garage" };

export default function Privacidade() {
  return (
    <main className="max-w-2xl mx-auto p-6 prose prose-neutral text-neutral-800 space-y-4">
      <h1 className="text-2xl font-semibold">Política de Privacidade</h1>
      <p>
        Este atendimento automático pertence à <strong>Ultra Scooter Garage</strong>.
        Ao enviar uma mensagem para o nosso WhatsApp, você concorda com o uso das
        informações descritas abaixo.
      </p>

      <h2 className="text-lg font-medium">Que dados coletamos</h2>
      <p>
        Coletamos apenas o necessário para responder ao seu contato: seu número de
        WhatsApp, seu nome de perfil (quando disponível) e o conteúdo das mensagens
        que você nos envia.
      </p>

      <h2 className="text-lg font-medium">Como usamos</h2>
      <p>
        Usamos esses dados exclusivamente para responder às suas perguntas, apresentar
        nossos produtos e serviços, e dar continuidade ao atendimento por um vendedor.
        Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.
      </p>

      <h2 className="text-lg font-medium">Por quanto tempo guardamos</h2>
      <p>
        Mantemos o histórico da conversa pelo tempo necessário ao atendimento e ao
        relacionamento comercial. Você pode solicitar a exclusão a qualquer momento.
      </p>

      <h2 className="text-lg font-medium">Seus direitos</h2>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados. Veja como na
        página de <a href="/exclusao-de-dados">exclusão de dados</a>.
      </p>

      <p className="text-sm text-neutral-500">
        Contato: envie uma mensagem ao nosso WhatsApp com o assunto “Privacidade”.
      </p>
    </main>
  );
}
