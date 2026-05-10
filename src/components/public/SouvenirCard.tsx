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
        <div className="mt-auto pt-4 border-t border-atlas-navy-aero/30 flex items-center justify-between">
          <span className="text-xl font-bold text-atlas-gold-main">{formatCurrencyBRL(souvenir.price)}</span>
          <button 
            disabled={!souvenir.available}
            className="text-xs px-4 py-2 bg-atlas-navy-secondary text-white rounded hover:bg-atlas-navy-aero transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-semibold"
          >
            Tenho Interesse
          </button>
        </div>
      </div>
    </div>
  );
}
