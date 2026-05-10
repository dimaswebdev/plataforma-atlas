import Image from "next/image";
import Link from "next/link";


export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-40 border-t border-atlas-gold-main/30 bg-[#030812] w-full pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-8">
          
          {/* AREA INSTITUCIONAL */}
          <div className="flex flex-col items-center lg:items-start flex-1 text-center lg:text-left">
            <div className="mb-6 group">
              <Image
                src="/logo-fab.svg"
                alt="Logo FAB"
                width={48}
                height={48}
                className="transition-transform duration-500 group-hover:scale-110"
                style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
              />
            </div>
            
            <p className="text-atlas-gold-main text-[13px] font-black tracking-[0.4em] uppercase mb-2">
              ATLAS &nbsp;·&nbsp; BINFA &nbsp;·&nbsp; BRASIL
            </p>
            
            <p className="text-atlas-text-muted/60 text-[11px] tracking-widest font-medium uppercase">
              &copy; Desenvolvido por Dimas Designer - {currentYear}
            </p>
          </div>

          {/* BARRA VERTICAL (Desktop Only) */}
          <div className="hidden lg:block w-[1px] h-32 bg-gradient-to-b from-transparent via-atlas-gold-main/20 to-transparent self-center"></div>

          {/* AREA DE TERMOS */}
          <div className="flex flex-col items-center lg:items-end flex-1">
            <h4 className="text-white text-[10px] font-black tracking-[0.3em] uppercase mb-6 opacity-40">
              Termos e Documentos
            </h4>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-3">
              {[
                { label: "Termo de Adesão", href: "/termos/adesao" },
                { label: "Privacidade", href: "/politica-privacidade" },
                { label: "Termos de Uso", href: "/termos/uso" },
                { label: "Uso de Imagem", href: "/termos/uso-imagem" },
                { label: "Souvenirs", href: "/termos/souvenirs" },
                { label: "Pagamentos", href: "/termos/pagamentos" },
                { label: "Transparência", href: "/termos/transparencia-financeira" }
              ].map((link, idx) => (
                <Link 
                  key={idx} 
                  href={link.href}
                  className="text-atlas-text-muted hover:text-atlas-gold-main text-xs font-bold uppercase tracking-wider transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Decorative divider for mobile */}
        <div className="lg:hidden w-24 h-[1px] bg-atlas-gold-main/20 mx-auto my-8"></div>
      </div>
    </footer>
  );
}
