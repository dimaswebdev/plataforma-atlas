import { TermPageLayout } from "@/components/public/TermPageLayout";
import { PLATFORM_TERMS_VERSION } from "@/lib/legal-constants";

export default function TermosUsoPage() {
  return (
    <TermPageLayout 
      title="Termos de Uso da Plataforma" 
      version={PLATFORM_TERMS_VERSION}
      lastUpdate="10/05/2026"
    >
      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mb-6">1. APRESENTAÇÃO</h2>
      <p>
        Estes Termos de Uso regulam o acesso e utilização do Portal ATLAS, plataforma digital criada para centralizar informações do Reencontro 30 Anos — Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">2. FINALIDADE DA PLATAFORMA</h2>
      <p>
        O Portal ATLAS tem finalidade informativa e administrativa, servindo como canal oficial para confirmação de presença, controle de arrecadação, prestação de contas e comunicados.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">3. ÁREA ADMINISTRATIVA</h2>
      <p>
        A área administrativa é restrita à Comissão Organizadora. É proibido compartilhar credenciais de acesso ou utilizar a plataforma para fins alheios ao evento da Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">4. RESPONSABILIDADE DO USUÁRIO</h2>
      <p>
        O usuário compromete-se a fornecer informações verdadeiras e não praticar atos que prejudiquem a segurança da plataforma ou a privacidade dos demais membros.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">5. INFORMAÇÕES PUBLICADAS</h2>
      <p>
        A Comissão buscará manter os dados atualizados, mas poderá haver alterações em prazos, fornecedores ou programação, sempre comunicadas via Portal ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">6. LINKS EXTERNOS</h2>
      <p>
        O Portal pode conter links para serviços externos (Asaas, WhatsApp). A Comissão não se responsabiliza pelas políticas ou funcionamento dessas plataformas de terceiros.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">7. PROPRIEDADE DO CONTEÚDO</h2>
      <p>
        A identidade visual, brasão e materiais oficiais do Portal ATLAS são destinados ao uso exclusivo do evento comemorativo da Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">8. ACEITE</h2>
      <p>
        Ao navegar ou utilizar o Portal ATLAS, o usuário declara ciência destes Termos de Uso e das responsabilidades aqui descritas.
      </p>
    </TermPageLayout>
  );
}
