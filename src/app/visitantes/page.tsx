import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { Plane, Hotel, Map, Car } from "lucide-react";
import Link from "next/link";

export default function VisitantesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/bg-visitantes.png"
        accent="Guia do Evento"
        title="Informações para Visitantes"
        subtitle="Orientações importantes para os integrantes da Turma ATLAS que virão de outras cidades ou estados."
      />
      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">

        <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-lg sm:p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-atlas-gold-main/10 rounded-full border border-atlas-gold-main/30 mr-4">
                <Plane className="w-6 h-6 text-atlas-gold-main" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Chegada a Campo Grande</h2>
            </div>
            <p className="text-atlas-text-muted mb-4">
              O Aeroporto Internacional de Campo Grande (CGR) recebe voos diários das principais capitais. Recomendamos a compra de passagens com antecedência.
            </p>
            <ul className="list-disc list-inside text-atlas-text-light text-sm space-y-2">
              <li>Distância do aeroporto ao centro: aprox. 7km</li>
              <li>Tempo médio de deslocamento: 15-20 min</li>
            </ul>
          </div>

          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-lg sm:p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-900/30 rounded-full border border-blue-500/30 mr-4">
                <Hotel className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Hospedagem Parceira</h2>
            </div>
            <p className="text-atlas-text-muted mb-4">
              A comissão organizadora está em negociação com hotéis locais para tarifas especiais à Turma ATLAS.
            </p>
            <div className="bg-atlas-navy-base p-4 rounded border border-atlas-navy-aero/50 border-dashed text-center">
              <span className="text-atlas-text-light font-medium tracking-widest uppercase text-sm">Status: Em Negociação</span>
            </div>
          </div>

          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-lg sm:p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-900/30 rounded-full border border-green-500/30 mr-4">
                <Car className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Transporte Local</h2>
            </div>
            <p className="text-atlas-text-muted mb-4">
              Aplicativos como Uber e 99 funcionam muito bem em Campo Grande. Aluguel de veículos também está disponível no aeroporto.
            </p>
          </div>

          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-5 shadow-lg sm:p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-red-900/30 rounded-full border border-red-500/30 mr-4">
                <Map className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Apoio da Comissão</h2>
            </div>
            <p className="text-atlas-text-muted mb-6">
              Se você precisa de ajuda específica com logística, não deixe de marcar as opções no formulário de confirmação.
            </p>
            <Link 
              href="/confirmar-interesse"
              className="inline-flex w-full justify-center rounded bg-atlas-gold-main px-6 py-2 text-sm font-semibold uppercase tracking-wider text-atlas-navy-deep transition-colors hover:bg-atlas-gold-dark sm:w-auto"
            >
              Preencher Formulário
            </Link>
          </div>
        </div>

      </main>
      <PublicFooter />
    </div>
  );
}
