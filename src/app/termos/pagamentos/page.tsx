import { TermPageLayout } from "@/components/public/TermPageLayout";
import { PAYMENTS_TERM_VERSION } from "@/lib/legal-constants";

export default function TermoPagamentosPage() {
  return (
    <TermPageLayout 
      title="Pagamentos e Cobranças" 
      version={PAYMENTS_TERM_VERSION}
      lastUpdate="10/05/2026"
    >
      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mb-6">1. FORMAS DE PAGAMENTO</h2>
      <p>
        Os pagamentos poderão ser realizados via Pix, boleto ou cartão de crédito, conforme disponibilizado pela Comissão Organizadora.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">2. PLATAFORMA DE PAGAMENTO (ASAAS)</h2>
      <p>
        Poderá ser utilizada a plataforma Asaas para emissão de cobranças e controle financeiro. O participante deve observar os termos da plataforma ao realizar a transação.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">3. CONFIRMAÇÃO E STATUS</h2>
      <p>
        A confirmação pode ser automática (via sistema) ou manual (via envio de comprovante). O status no Portal ATLAS será atualizado conforme o processamento bancário.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">4. TAXAS ADMINISTRATIVAS</h2>
      <p>
        Eventuais taxas cobradas por bancos ou intermediadores de pagamento serão consideradas despesas administrativas do evento.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">5. SEGURANÇA</h2>
      <p>
        A Comissão jamais solicitará senhas por mensagem. Utilize apenas os canais e links oficiais divulgados no Portal ATLAS para realizar seus pagamentos.
      </p>
    </TermPageLayout>
  );
}
