import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="relative z-40 border-t border-atlas-gold-main/60 bg-[#060e1c]/95 backdrop-blur-md w-full mt-8">
      {/* Absolute positioned icon acting as a transition marker cutting the border */}
      <div className="absolute left-1/2 -top-7 -translate-x-1/2 bg-[#060e1c] w-14 h-14 rounded-full border border-atlas-gold-main/60 shadow-lg flex items-center justify-center">
        <Image
          src="/logo-fab.svg"
          alt="Logo FAB"
          width={36}
          height={36}
          style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
        />
      </div>

      <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-1">
        {/* Center: branding text */}
        <p className="text-atlas-gold-main text-[11px] font-bold tracking-[0.5em] uppercase text-center px-4 mt-1">
          ATLAS &nbsp;·&nbsp; BINFA &nbsp;·&nbsp; BRASIL
        </p>

        {/* Center: copyright */}
        <p className="text-atlas-text-muted/60 text-[10px] tracking-wide mt-1 text-center px-4">
          &copy; Desenvolvido por Dimas Designer - 2026
        </p>
      </div>
    </footer>
  );
}
