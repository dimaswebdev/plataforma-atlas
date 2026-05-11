import { Souvenir } from "@/types/souvenir";
import { formatCurrencyBRL } from "@/lib/utils";

export function SouvenirCard({ souvenir }: { souvenir: Souvenir }) {
  return (
    <div className="bg-atlas-navy-deep border border-atlas-navy-aero/30 rounded-lg overflow-hidden flex flex-col h-full shadow-lg transition-transform hover:scale-[1.02]">
      <div className="aspect-square bg-atlas-navy-base flex items-center justify-center p-6 border-b border-atlas-navy-aero/30 relative">
        {souvenir.imageUrl ? (
          <img src={souvenir.imageUrl} alt={souvenir.name} className="object-contain w-full h-full" />
        ) : (
          <div className="w-full h-full bg-atlas-navy-aero/10 flex items-center justify-center text-atlas-text-muted/50 uppercase tracking-widest text-sm border border-dashed border-atlas-navy-aero/50 rounded">
            Imagem Indisponível
          </div>
        )}
        {!souvenir.available && (
          <div className="absolute top-2 right-2 bg-red-900/80 text-red-100 text-xs px-2 py-1 rounded uppercase tracking-wider font-semibold backdrop-blur-sm">
            Esgotado
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white mb-2">{souvenir.name}</h3>
        {souvenir.description && (
          <p className="text-sm text-atlas-text-muted mb-4 flex-grow">{souvenir.description}</p>
        )}
        <div className="mt-auto flex flex-col gap-3 border-t border-atlas-navy-aero/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xl font-bold text-atlas-gold-main">{formatCurrencyBRL(souvenir.price)}</span>
          <button 
            disabled={!souvenir.available}
            className="w-full rounded bg-atlas-navy-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-atlas-navy-aero disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Tenho Interesse
          </button>
        </div>
      </div>
    </div>
  );
}
