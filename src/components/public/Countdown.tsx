"use client";

import { useEffect, useState } from "react";

export function Countdown({ targetDateStr, compact }: { targetDateStr: string; compact?: boolean }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const targetDate = new Date(targetDateStr).getTime();
    
    const calculate = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setDaysLeft(Math.floor(difference / (1000 * 60 * 60 * 24)));
      } else {
        setDaysLeft(0);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (compact) {
    return (
      <div className="bg-transparent border border-atlas-gold-main/40 backdrop-blur-md px-8 py-5 rounded-lg shadow-xl
                      transition-all duration-300 hover:border-atlas-gold-main hover:bg-white/5 hover:shadow-atlas-gold-main/20 hover:shadow-2xl
                      min-w-[220px] cursor-default">
        <p className="text-[10px] text-atlas-gold-main uppercase tracking-[0.3em] font-bold mb-3">Dias para o Evento</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black text-white leading-none">{daysLeft}</span>
          <span className="text-atlas-text-muted text-sm mb-1">dias</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 shadow-lg">
      <span className="text-4xl font-bold text-atlas-gold-main">{daysLeft}</span>
      <span className="text-sm font-medium text-atlas-text-muted uppercase tracking-widest mt-1">
        Dias para o evento
      </span>
    </div>
  );
}
