import { TermPageLayout } from "@/components/public/TermPageLayout";
import { FINANCIAL_TERMS_VERSION } from "@/lib/legal-constants";

export default function TermoTransparenciaPage() {
  return (
    <TermPageLayout 
      title="Transparência Financeira" 
      version={FINANCIAL_TERMS_VERSION}
      lastUpdate="10/05/2026"
    >
      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mb-6">1. FINALIDADE</h2>
      <p>
        Este termo estabelece as regras de transparência e prestação de contas do Reencontro 30 Anos.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">2. REGISTRO DE ENTRADAS E SAÍDAS</h2>
      <p>
        Todas as receitas (adesões, patrocínios) e despesas (buffet, brindes, taxas) serão registradas e acompanhadas pela Comissão Organizadora.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">3. PRESTAÇÃO DE CONTAS PÚBLICA</h2>
      <p>
        O Portal ATLAS exibirá um resumo consolidado contendo a meta financeira, total arrecadado e saldo atual, permitindo que a turma acompanhe a saúde financeira do projeto.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">4. PROTEÇÃO DE DADOS INDIVIDUAIS</h2>
      <p>
        A prestação de contas não exibirá nomes de inadimplentes ou valores individuais de cada membro, preservando a privacidade dos integrantes da Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">5. SALDO REMANESCENTE</h2>
      <p>
        Havendo saldo positivo após o evento, a comissão submeterá à turma a decisão sobre o uso do valor (doação, rateio ou reserva para encontros futuros).
      </p>
    </TermPageLayout>
  );
}
