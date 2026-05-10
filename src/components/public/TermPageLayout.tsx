import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

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

      <main className="flex-grow py-12 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            href="/termos" 
            className="flex items-center gap-2 text-atlas-gold-main hover:text-atlas-gold-dark transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Documentos
          </Link>
          
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-atlas-gold-main/10 border border-atlas-gold-main/20 rounded text-atlas-gold-main">
              <ShieldCheck className="w-3 h-3" /> Versão: {version}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded text-atlas-text-muted">
              <Clock className="w-3 h-3" /> Atualizado: {lastUpdate}
            </div>
          </div>
        </div>

        <div className="bg-atlas-navy-deep p-8 md:p-12 rounded-xl border border-atlas-navy-aero/20 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-gold-main/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <article className="prose prose-invert prose-gold max-w-none relative z-10 text-atlas-text-light leading-relaxed">
            {children}
          </article>

          <div className="mt-12 pt-8 border-t border-atlas-navy-aero/20 text-center">
            <p className="text-xs text-atlas-text-muted font-medium mb-4">
              Dúvidas sobre este termo podem ser encaminhadas à Comissão Organizadora pelo canal oficial informado no Portal ATLAS.
            </p>
            <div className="flex justify-center items-center gap-4 opacity-50 grayscale contrast-125">
               <img src="/images/fab-logo.svg" alt="FAB" className="w-10 h-10" />
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
