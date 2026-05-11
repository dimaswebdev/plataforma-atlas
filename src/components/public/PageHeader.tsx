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
      <div className="relative z-20 mx-auto max-w-7xl px-4 py-9 sm:px-6 md:px-10 md:py-12 lg:px-12 lg:py-14">
        {accent && (
          <p className="atlas-kicker mb-3 flex items-center gap-2 text-atlas-gold-main">
            <span className="inline-block h-px w-4 bg-atlas-gold-main md:w-6" />
            {accent}
          </p>
        )}
        <h1 className="atlas-page-title mb-3 max-w-4xl text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl border-l-2 border-atlas-gold-main pl-4 text-sm leading-relaxed text-atlas-text-muted md:text-base">
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
