import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="relative z-20 border-t border-atlas-gold-main/60 bg-[#060e1c] backdrop-blur-md w-full">
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        {/* Center: branding logo */}
        <div className="mb-2">
          <Image
            src="/logo-fab.svg"
            alt="Logo FAB"
            width={46}
            height={46}
            style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
          />
        </div>

        {/* Center: branding text */}
        <p className="text-atlas-gold-main text-[11px] font-bold tracking-[0.5em] uppercase text-center px-4">
          ATLAS &nbsp;·&nbsp; BINFA &nbsp;·&nbsp; BRASIL
        </p>

        {/* Center: copyright */}
        <p className="text-atlas-text-muted/70 text-[11px] tracking-wide mt-2 text-center px-4">
          &copy; Desenvolvido por Dimas Designer - 2026
        </p>
      </div>
    </footer>
  );
}
