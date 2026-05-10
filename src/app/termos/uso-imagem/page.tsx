import { TermPageLayout } from "@/components/public/TermPageLayout";
import { IMAGE_USE_TERM_VERSION } from "@/lib/legal-constants";

export default function TermoUsoImagemPage() {
  return (
    <TermPageLayout 
      title="Termo de Autorização de Uso de Imagem" 
      version={IMAGE_USE_TERM_VERSION}
      lastUpdate="10/05/2026"
    >
      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mb-6">1. OBJETO</h2>
      <p>
        Este termo trata da autorização para uso de imagem, voz, nome e apelido relacionados ao Reencontro 30 Anos — Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">2. AUTORIZAÇÃO</h2>
      <p>
        Ao autorizar no formulário, o participante permite que a Comissão utilize registros audiovisuais captados durante o evento para fins comemorativos e históricos.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">3. FINALIDADES AUTORIZADAS</h2>
      <p>
        A autorização abrange a galeria oficial, vídeos comemorativos, álbuns digitais e retrospectivas destinadas aos integrantes da Turma ATLAS.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">4. GRATUIDADE</h2>
      <p>
        A autorização é concedida de forma gratuita, sem qualquer remuneração, por se tratar de um evento social e memorial de caráter privado da turma.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">5. PRAZO E REVOGAÇÃO</h2>
      <p>
        A autorização é válida por prazo indeterminado para fins históricos. O participante pode solicitar a revogação para usos futuros entrando em contato com a Comissão.
      </p>

      <h2 className="text-atlas-gold-main uppercase tracking-widest font-black text-xl mt-12 mb-6">6. LIMITES DE USO</h2>
      <p>
        A imagem não será utilizada de forma ofensiva ou para fins comerciais alheios ao evento. Em registros amplos de ambiente, o participante aceita que sua imagem possa aparecer de forma incidental.
      </p>
    </TermPageLayout>
  );
}
