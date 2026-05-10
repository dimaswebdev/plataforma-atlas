import { TermPageLayout } from "@/components/public/TermPageLayout";
import { SOUVENIRS_TERM_VERSION } from "@/lib/legal-constants";

export default function TermoSouvenirsPage() {
  return (
    <TermPageLayout 
      title="Souvenirs e Kit Oficial ATLAS" 
      version={SOUVENIRS_TERM_VERSION}
      lastUpdate="10/05/2026"
    >
      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mb-6">1. APRESENTAÇÃO</h2>
      <p>
        Este termo estabelece as condições para encomenda, pagamento e entrega de souvenirs e do Kit Oficial ATLAS 30 Anos.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">2. LEVANTAMENTO DE INTERESSE</h2>
      <p>
        O preenchimento inicial no formulário serve para levantamento de quantidades e tamanhos. A compra só é efetivada após o pagamento confirmado conforme as regras da Comissão.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">3. TAMANHOS E PERSONALIZAÇÃO</h2>
      <p>
        O participante é responsável por informar corretamente seus tamanhos. Itens personalizados com nome ou medidas específicas não admitem troca ou devolução.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">4. PRAZOS E PRODUÇÃO</h2>
      <p>
        A produção depende de quantidades mínimas e dos prazos dos fornecedores. A Comissão informará a previsão de entrega dos kits e souvenirs oficiais.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">5. CANCELAMENTO</h2>
      <p>
        A Comissão poderá cancelar determinado item caso não haja viabilidade de produção, devolvendo os valores eventualmente pagos por aquele produto específico.
      </p>
    </TermPageLayout>
  );
}
