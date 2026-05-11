import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface TermPageLayoutProps {
  title: string;
  version: string;
  lastUpdate: string;
  children: React.ReactNode;
}

export function TermPageLayout({ title, version, lastUpdate, children }: TermPageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      
      <PageHeader 
        bgImage="/images/hero-bg.png"
        accent="Documentos Oficiais"
        title={title}
        subtitle="Regras, transparência e responsabilidades para o Reencontro 30 Anos."
      />

      <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            href="/termos" 
            className="flex items-center gap-2 text-atlas-gold-main hover:text-atlas-gold-dark transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Documentos
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider sm:gap-4">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-atlas-gold-main/10 border border-atlas-gold-main/20 rounded text-atlas-gold-main">
              <ShieldCheck className="w-3 h-3" /> Versão: {version}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded text-atlas-text-muted">
              <Clock className="w-3 h-3" /> Atualizado: {lastUpdate}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-atlas-navy-aero/20 bg-atlas-navy-deep p-5 shadow-2xl sm:p-8 md:p-12">
          <article className="atlas-longform prose prose-invert prose-gold relative z-10 mx-auto max-w-3xl text-atlas-text-light">
            {children}
          </article>

          <div className="mt-12 pt-8 border-t border-atlas-navy-aero/20 text-center">
            <p className="text-xs text-atlas-text-muted font-medium mb-4">
              Dúvidas sobre este termo podem ser encaminhadas à Comissão Organizadora pelo canal oficial informado no Portal ATLAS.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 opacity-50 grayscale contrast-125">
               <Image src="/images/fab-logo.svg" alt="FAB" width={40} height={40} className="h-10 w-10" />
               <div className="h-8 w-[1px] bg-white/20"></div>
               <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Turma ATLAS 30 Anos</span>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
