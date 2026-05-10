import { TermPageLayout } from "@/components/public/TermPageLayout";
import { PRIVACY_POLICY_VERSION } from "@/lib/legal-constants";

export default function PoliticaPrivacidadePage() {
  return (
    <TermPageLayout 
      title="Política de Privacidade" 
      version={PRIVACY_POLICY_VERSION}
      lastUpdate="10/05/2026"
    >
      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mb-6">1. APRESENTAÇÃO</h2>
      <p>
        Esta Política de Privacidade explica como o Portal ATLAS coleta, utiliza, armazena, protege e compartilha dados pessoais fornecidos pelos participantes do Reencontro 30 Anos — Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">2. DADOS COLETADOS</h2>
      <p>O Portal ATLAS poderá coletar os seguintes dados:</p>
      <ul>
        <li>Nome completo, apelido ou nome de guerra;</li>
        <li>Telefone e E-mail;</li>
        <li>Cidade, estado e país;</li>
        <li>Data de nascimento e profissão;</li>
        <li>Confirmação de presença e quantidade de convidados;</li>
        <li>Tamanhos de vestuário e medidas (para souvenirs);</li>
        <li>Dados de pagamento e status financeiro;</li>
        <li>Autorização de uso de imagem.</li>
      </ul>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">3. FINALIDADE DO USO DOS DADOS</h2>
      <p>
        Os dados serão utilizados para: cadastrar participantes, confirmar presença, organizar logística, controlar arrecadação, produzir souvenirs personalizados e manter a comunicação oficial da Comissão Organizadora.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">4. DADOS DE MEDIDAS E VESTUÁRIO</h2>
      <p>
        Dados como tamanho de camiseta, jaqueta, altura e peso serão utilizados exclusivamente para produção de souvenirs e kits oficiais. Esses dados não serão exibidos publicamente.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">5. DADOS FINANCEIROS</h2>
      <p>
        Informações individuais de pagamento são acessíveis apenas à Comissão Organizadora. A prestação de contas pública exibirá apenas dados consolidados, sem exposição individual.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">6. COMPARTILHAMENTO DE DADOS</h2>
      <p>
        Os dados poderão ser compartilhados com membros autorizados da Comissão, fornecedores contratados (buffet, souvenirs) e plataformas de pagamento (Asaas), sempre limitados ao necessário.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">7. ARMAZENAMENTO E SEGURANÇA</h2>
      <p>
        Os dados são armazenados em ambiente digital protegido. Adotamos medidas de segurança para evitar acessos não autorizados ou uso indevido das informações.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">8. TEMPO DE GUARDA</h2>
      <p>
        Os dados serão mantidos durante a organização e conclusão financeira do evento. Após o encerramento, poderão ser arquivados para fins históricos e administrativos da Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">9. DIREITOS DO TITULAR</h2>
      <p>
        O participante poderá solicitar acesso, correção ou exclusão de seus dados, bem como revogar consentimentos opcionais (como uso de imagem), mediante contato com a Comissão.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">10. USO DE IMAGEM</h2>
      <p>
        Quando autorizado, fotos e vídeos poderão ser usados em materiais oficiais, galeria e retrospectivas. A autorização pode ser recusada no formulário de cadastro.
      </p>
    </TermPageLayout>
  );
}
