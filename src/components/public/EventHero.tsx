import Link from "next/link";
import { Event } from "@/types/event";
import { Shield } from "lucide-react";
import Image from "next/image";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";

export function EventHero({ event, children }: { event: Event; children?: React.ReactNode }) {
  return (
    <section className="relative min-h-screen lg:h-screen flex flex-col overflow-hidden bg-[#060e1c]">
      
      {/* ── CINEMATIC BACKGROUND ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.png')",
          transform: "scaleX(-1)",
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b lg:bg-gradient-to-r from-[#060e1c] via-[#060e1c]/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 z-10 bg-gradient-to-t from-[#060e1c] to-transparent" />
      <div
        className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)",
        }}
      />

      {/* ── NAVBAR ── */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <PublicNav />
      </div>

      {/* ── HERO CONTENT ── */}
      <div className="relative z-20 flex-1 flex flex-col lg:flex-row pt-24 lg:pt-16 pb-12 lg:pb-2">

        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 w-full lg:max-w-[55%] text-center lg:text-left items-center lg:items-start">

          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/logo-fab.svg"
              alt="Logo FAB"
              width={36}
              height={36}
              className="opacity-90 w-[32px] h-[32px] md:w-[40px] md:h-[40px]"
              style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
            />
            <p className="text-atlas-gold-main text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">
              FAB&nbsp;&nbsp;|&nbsp;&nbsp;1997–2027
            </p>
          </div>

          <div className="w-full lg:w-fit mb-8">
            <h1 className="font-black text-white uppercase tracking-tight mb-4" style={{ fontSize: 'clamp(2.2rem, 8vw, 5.5rem)', lineHeight: '1.0' }}>
              <div className="block">Reencontro</div>
              <div className="flex items-center justify-center lg:justify-start gap-4 my-2">
                <span className="hidden sm:inline-block h-[3px] md:h-[6px] w-12 md:w-28 rounded-sm bg-atlas-gold-main shrink-0" />
                <span className="text-atlas-gold-main">30 Anos</span>
                <span className="hidden sm:inline-block h-[3px] md:h-[6px] w-12 md:w-28 rounded-sm bg-atlas-gold-main shrink-0" />
              </div>
              <div className="block">Turma Atlas</div>
            </h1>

            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-atlas-gold-main to-transparent lg:from-atlas-gold-main lg:via-atlas-gold-main/50 lg:to-transparent" />
              <span className="text-atlas-gold-main text-[12px] tracking-[0.8em]">★ ★ ★</span>
            </div>
          </div>

          <p className="text-atlas-text-muted text-xs md:text-base leading-relaxed mb-10 max-w-lg lg:mx-0 mx-auto">
            {event.heroDescription}
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
            <Link
              href="/confirmar-interesse"
              className="group flex items-center gap-2 bg-atlas-gold-main text-atlas-navy-deep px-8 py-4 rounded font-black uppercase tracking-widest text-xs md:text-sm hover:bg-atlas-gold-dark transition-all duration-300 shadow-xl shadow-atlas-gold-main/20"
            >
              <Shield className="w-4 h-4" />
              Confirmar Presença
            </Link>
            <Link
              href="/programacao"
              className="flex items-center gap-2 border border-atlas-gold-main/50 text-white px-8 py-4 rounded font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-atlas-gold-main/10 hover:border-atlas-gold-main transition-all duration-300"
            >
              Ver Programação
              <span className="text-atlas-gold-main">→</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-atlas-text-muted/60 text-[10px] md:text-xs">
            <Shield className="w-3.5 h-3.5 text-atlas-gold-main/50" />
            <span>Sua participação fortalece nossa história.</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        {children && (
          <div className="w-full lg:w-auto flex flex-col lg:flex-col items-center lg:items-end justify-center gap-8 lg:gap-6 px-6 lg:absolute lg:right-12 xl:right-24 lg:top-1/2 lg:-translate-y-1/2 z-30">
            <div className="flex flex-col gap-5 w-full max-w-[280px] lg:max-w-none">
              {children}
            </div>

            <div className="flex lg:flex-col items-center lg:items-end gap-5 mt-4">
              {[
                { 
                  href: "https://instagram.com/turmaatlas30anos", 
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> 
                },
                { 
                  href: "https://facebook.com/turmaatlas30anos", 
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> 
                },
                { 
                  href: "https://wa.me/5567999999999", 
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> 
                },
              ].map((social, sIdx) => (
                <a
                  key={sIdx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-atlas-text-muted/40 hover:text-atlas-gold-main transition-colors duration-300 bg-white/5 p-3 rounded-full border border-white/5 hover:border-atlas-gold-main/30 backdrop-blur-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <PublicFooter />
    </section>
  );
}
