export function Countdown({ targetDateStr, compact }: { targetDateStr: string; compact?: boolean }) {
  void targetDateStr;
  const daysLeft = 0; // Event date not yet defined

  if (compact) {
    return (
      <div className="w-full min-w-0 bg-transparent border border-atlas-gold-main/40 backdrop-blur-md px-5 py-5 sm:px-8 rounded-lg shadow-xl
                      transition-all duration-300 hover:border-atlas-gold-main hover:bg-white/5 hover:shadow-atlas-gold-main/20 hover:shadow-2xl
                      cursor-default">
        <p className="atlas-kicker mb-3 text-atlas-gold-main">Dias para o Evento</p>
        <div className="flex items-end gap-2">
          <span className="atlas-feature-value text-white">{daysLeft}</span>
          <span className="text-atlas-text-muted text-sm mb-1">dias</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 shadow-lg">
      <span className="atlas-feature-value text-atlas-gold-main">{daysLeft}</span>
      <span className="mt-1 text-sm font-medium uppercase tracking-normal text-atlas-text-muted">
        Dias para o evento
      </span>
    </div>
  );
}
