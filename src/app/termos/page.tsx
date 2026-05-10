import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { FileText, Shield, UserCheck, Image, ShoppingBag, DollarSign, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

const documents = [
  {
    title: "Termo de Adesão",
    desc: "Condições gerais de participação no reencontro.",
    href: "/termos/adesao",
    icon: UserCheck,
    color: "text-blue-400"
  },
  {
    title: "Política de Privacidade",
    desc: "Como cuidamos e protegemos seus dados pessoais.",
    href: "/politica-privacidade",
    icon: Shield,
    color: "text-green-400"
  },
  {
    title: "Termos de Uso",
    desc: "Regras de utilização do Portal ATLAS.",
    href: "/termos/uso",
    icon: FileText,
    color: "text-atlas-gold-main"
  },
  {
    title: "Uso de Imagem",
    desc: "Autorização para registros oficiais e vídeos.",
    href: "/termos/uso-imagem",
    icon: Image,
    color: "text-purple-400"
  },
  {
    title: "Souvenirs e Kit Oficial",
    desc: "Regras de encomenda, tamanhos e entrega.",
    href: "/termos/souvenirs",
    icon: ShoppingBag,
    color: "text-orange-400"
  },
  {
    title: "Pagamentos e Cobranças",
    desc: "Métodos, prazos e integração com Asaas.",
    href: "/termos/pagamentos",
    icon: DollarSign,
    color: "text-emerald-400"
  },
  {
    title: "Transparência Financeira",
    desc: "Regras de prestação de contas e arrecadação.",
    href: "/termos/transparencia-financeira",
    icon: BarChart3,
    color: "text-cyan-400"
  }
];

export default function TermosIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader 
        bgImage="/images/hero-bg.png"
        accent="Central de Transparência"
        title="Termos e Documentos"
        subtitle="Consulte aqui todos os documentos oficiais que regem a organização do Reencontro 30 Anos."
      />

      <main className="flex-grow py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <Link key={idx} href={doc.href} className="group relative bg-atlas-navy-deep p-8 rounded-2xl border border-atlas-navy-aero/20 hover:border-atlas-gold-main/50 transition-all duration-500 overflow-hidden shadow-xl">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-atlas-gold-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className={`p-4 bg-atlas-navy-base rounded-2xl border border-white/5 w-fit mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:border-atlas-gold-main/30`}>
                  <doc.icon className={`w-8 h-8 ${doc.color}`} />
                </div>
                
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wider group-hover:text-atlas-gold-main transition-colors">
                  {doc.title}
                </h3>
                
                <p className="text-atlas-text-muted text-sm leading-relaxed mb-6">
                  {doc.desc}
                </p>
                
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-atlas-gold-main group-hover:translate-x-2 transition-transform duration-500">
                  Acessar Documento <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 p-8 bg-atlas-navy-base/50 rounded-2xl border border-dashed border-atlas-navy-aero/30 text-center">
          <p className="text-atlas-text-muted text-sm max-w-2xl mx-auto">
            A Comissão Organizadora recomenda a leitura atenta de todos os termos antes da confirmação de presença e adesão ao evento. Em caso de dúvidas, utilize os canais oficiais de comunicação.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
