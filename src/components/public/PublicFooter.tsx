import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Privacidade", href: "/politica-privacidade" },
  { label: "Transparência", href: "/termos/transparencia-financeira" },
];

const goldLogoFilter =
  "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-40 w-full border-t border-atlas-gold-main/60 bg-[#030812]">
      <div className="border-t border-atlas-gold-main/20" />

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(72px,0.32fr)_auto_minmax(72px,0.32fr)_minmax(0,1fr)] lg:gap-8">
          <p className="text-center text-[10px] font-semibold tracking-[0.08em] text-atlas-text-muted/75 lg:justify-self-start lg:text-left">
            © Dimas Designer - {currentYear}
          </p>

          <div className="hidden h-px w-full bg-atlas-gold-main/35 lg:block" />

          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/logo-fab.svg"
              alt="Logo FAB"
              width={42}
              height={42}
              className="mb-3 opacity-95"
              style={{ filter: goldLogoFilter }}
              priority={false}
            />

            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-atlas-gold-main sm:text-[11px]">
              ATLAS <span className="mx-1">.</span> BINFA <span className="mx-1">.</span> BRASIL
            </p>
          </div>

          <div className="hidden h-px w-full bg-atlas-gold-main/35 lg:block" />

          <nav
            aria-label="Links legais"
            className="flex max-w-full flex-wrap items-center justify-center gap-y-2 text-center lg:justify-self-end lg:text-right"
          >
            {footerLinks.map((link, index) => (
              <div key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className="whitespace-nowrap px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-atlas-text-muted/70 transition-colors duration-300 hover:text-atlas-gold-main"
                >
                  {link.label}
                </Link>

                {index < footerLinks.length - 1 && (
                  <span className="h-3 w-px bg-atlas-gold-main/35" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-b border-atlas-gold-main/50" />
    </footer>
  );
}
