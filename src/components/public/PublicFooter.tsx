import Image from "next/image";
import Link from "next/link";


export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-40 border-t border-atlas-gold-main/50 bg-[#030812] w-full pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">

          {/* AREA INSTITUCIONAL */}
          <div className="flex flex-col items-center lg:items-start flex-1">
            <div className="flex items-center gap-4 group opacity-90 hover:opacity-100 transition-opacity duration-500">
              <Image
                src="/logo-fab.svg"
                alt="Logo FAB"
                width={32}
                height={32}
                style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
              />

              {/* Pequeno divisor vertical */}
              <div className="w-[1px] h-6 bg-atlas-gold-main/30"></div>

              <p className="text-atlas-gold-main text-[11px] font-black tracking-[0.4em] uppercase whitespace-nowrap">
                ATLAS &nbsp;·&nbsp; BINFA &nbsp;·&nbsp; BRASIL
              </p>
            </div>

            <p className="text-atlas-text-muted/30 text-[8px] tracking-widest font-medium uppercase mt-2 lg:ml-[48px]">
              &copy; {currentYear} Dimas Designer
            </p>
          </div>

          {/* BARRA VERTICAL PRINCIPAL */}
          <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent self-center"></div>

          {/* AREA DE TERMOS */}
          <div className="flex flex-col items-center lg:items-end flex-1 w-full lg:w-auto">
            <h4 className="!text-[#D4AF37] text-[8px] font-black tracking-[0.3em] uppercase mb-4 drop-shadow-[0_0_8px_rgba(212,175,55,0.25)]">
              Documentos Oficiais
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center lg:justify-end gap-x-6 gap-y-4 w-full">
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
                  className="text-atlas-text-muted/50 hover:text-atlas-gold-main text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 py-1 flex items-center justify-center lg:justify-start"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
