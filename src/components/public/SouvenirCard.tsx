import { Souvenir } from "@/types/souvenir";
import { formatCurrencyBRL } from "@/lib/utils";

interface SouvenirCardProps {
  souvenir: Souvenir;
  onInterest?: (souvenir: Souvenir) => void;
}

export function SouvenirCard({ souvenir, onInterest }: SouvenirCardProps) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep shadow-lg transition-transform hover:-translate-y-1">
      <div className="relative flex aspect-square items-center justify-center border-b border-atlas-navy-aero/30 bg-atlas-navy-base p-6">
        {souvenir.imageUrl ? (
          <img src={souvenir.imageUrl} alt={souvenir.name} className="object-contain w-full h-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-atlas-navy-aero/50 bg-atlas-navy-aero/10 text-center text-sm uppercase text-atlas-text-muted/50">
            Imagem Indisponível
          </div>
        )}
        {!souvenir.available && (
          <div className="absolute right-2 top-2 rounded bg-atlas-gold-main/90 px-2 py-1 text-xs font-semibold uppercase text-atlas-navy-deep backdrop-blur-sm">
            Em definição
          </div>
        )}
      </div>
      <div className="flex flex-grow flex-col p-5">
        <h3 className="atlas-card-title mb-2 break-words text-white">{souvenir.name}</h3>
        {souvenir.description && (
          <p className="mb-4 flex-grow text-sm leading-relaxed text-atlas-text-muted">{souvenir.description}</p>
        )}
        {souvenir.sizes && souvenir.sizes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {souvenir.sizes.map((size) => (
              <span key={size} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-bold uppercase text-atlas-text-muted">
                {size}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-col gap-3 border-t border-atlas-navy-aero/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="atlas-metric-value text-atlas-gold-main">{formatCurrencyBRL(Number(souvenir.price || 0))}</span>
          <button 
            disabled={!souvenir.available}
            onClick={() => onInterest?.(souvenir)}
            className="w-full rounded bg-atlas-navy-secondary px-4 py-2 text-xs font-semibold uppercase text-white transition-colors hover:bg-atlas-navy-aero disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {souvenir.available ? "Tenho interesse" : "Em breve"}
          </button>
        </div>
      </div>
    </article>
  );
}
