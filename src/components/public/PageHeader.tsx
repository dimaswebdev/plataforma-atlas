/**
 * PageHeader — Cabeçalho premium com imagem de fundo para as páginas internas.
 * Cada página pode passar seu próprio bgImage para personalizar a atmosfera.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgImage: string; // e.g. '/images/bg-programacao.png'
  accent?: string; // optional decorative tag above the title
}

export function PageHeader({ title, subtitle, bgImage, accent }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-[#060e1c]">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* Heavy gradient — almost fully dark, shows image only at right/top */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#060e1c] via-[#060e1c]/90 to-[#060e1c]/50" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#060e1c] via-transparent to-[#060e1c]/60" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        {accent && (
          <p className="text-[10px] text-atlas-gold-main uppercase tracking-[0.35em] font-bold mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-atlas-gold-main inline-block" />
            {accent}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-atlas-text-muted text-sm border-l-2 border-atlas-gold-main pl-4 max-w-xl">
            {subtitle}
          </p>
        )}
        {/* Decorative bottom line */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px w-16 bg-atlas-gold-main" />
          <div className="h-px flex-1 bg-atlas-navy-aero/30" />
        </div>
      </div>
    </div>
  );
}
