import Image from "next/image";
import Link from "next/link";


export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-40 w-full border-t border-atlas-gold-main/50 bg-[#030812] pb-4 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">

          {/* AREA INSTITUCIONAL */}
          <div className="flex flex-col items-center lg:items-start flex-1">
            <div className="group flex max-w-full flex-wrap items-center justify-center gap-3 opacity-90 transition-opacity duration-500 hover:opacity-100 sm:gap-4 lg:justify-start">
              <Image
                src="/logo-fab.svg"
                alt="Logo FAB"
                width={32}
                height={32}
                style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
              />

              {/* Pequeno divisor vertical */}
              <div className="w-[1px] h-6 bg-atlas-gold-main/30"></div>

              <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-atlas-gold-main sm:text-[11px] sm:tracking-[0.28em] lg:text-left">
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
            <Link
              href="/termos"
              className="mb-4 !text-[#D4AF37] text-[8px] font-black uppercase tracking-[0.24em] drop-shadow-[0_0_8px_rgba(212,175,55,0.25)] transition-colors hover:text-atlas-gold-dark"
            >
              Termos e Documentos
            </Link>

            <div className="grid w-full grid-cols-1 justify-center gap-x-6 gap-y-3 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end lg:gap-y-4">
              {[
                { label: "Todos", href: "/termos" },
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
