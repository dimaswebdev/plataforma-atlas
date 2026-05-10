import Image from "next/image";
import Link from "next/link";


export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-40 border-t border-white/5 bg-[#030812] w-full pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 lg:gap-8">
          
          {/* AREA INSTITUCIONAL */}
          <div className="flex flex-col items-center lg:items-start flex-1 text-center lg:text-left">
            <div className="mb-4 group opacity-40 hover:opacity-80 transition-opacity duration-500">
              <Image
                src="/logo-fab.svg"
                alt="Logo FAB"
                width={32}
                height={32}
                style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
              />
            </div>
            
            <p className="text-atlas-gold-main text-[10px] font-black tracking-[0.4em] uppercase mb-1 opacity-70">
              ATLAS &nbsp;·&nbsp; BINFA &nbsp;·&nbsp; BRASIL
            </p>
            
            <p className="text-atlas-text-muted/30 text-[9px] tracking-widest font-medium uppercase">
              &copy; {currentYear} Dimas Designer
            </p>
          </div>

          {/* BARRA VERTICAL (Desktop Only) */}
          <div className="hidden lg:block w-[1px] h-16 bg-white/5 self-center"></div>

          {/* AREA DE TERMOS */}
          <div className="flex flex-col items-center lg:items-end flex-1">
            <h4 className="text-white text-[8px] font-black tracking-[0.3em] uppercase mb-4 opacity-20">
              Documentos Oficiais
            </h4>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-x-5 gap-y-2">
              {[
                { label: "Adesão", href: "/termos/adesao" },
                { label: "Privacidade", href: "/politica-privacidade" },
                { label: "Uso", href: "/termos/uso" },
                { label: "Imagem", href: "/termos/uso-imagem" },
                { label: "Souvenirs", href: "/termos/souvenirs" },
                { label: "Pagamentos", href: "/termos/pagamentos" },
                { label: "Transparência", href: "/termos/transparencia-financeira" }
              ].map((link, idx) => (
                <Link 
                  key={idx} 
                  href={link.href}
                  className="text-atlas-text-muted/40 hover:text-atlas-gold-main text-[9px] font-bold uppercase tracking-widest transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Decorative divider for mobile */}
        <div className="lg:hidden w-16 h-[1px] bg-white/5 mx-auto my-6"></div>
      </div>
    </footer>
  );
}
