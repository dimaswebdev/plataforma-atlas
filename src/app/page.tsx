"use client";

import { useEffect, useState } from "react";
import { EventHero } from "@/components/public/EventHero";
import { Countdown } from "@/components/public/Countdown";
import { Event } from "@/types/event";
import Link from "next/link";
import { ShieldCheck, UserRoundCheck } from "lucide-react";

export default function Home() {
  const [event, setEvent] = useState<Event | null>(null);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/event-data");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setEvent(data.event);
        setConfirmedCount(typeof data.confirmedCount === "number" ? data.confirmedCount : null);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-atlas-navy-base">
        <div className="atlas-loading-label animate-pulse">Carregando portal...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-atlas-navy-base px-4 text-center">
        <div className="w-full max-w-2xl rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 shadow-2xl sm:p-8">
          <p className="atlas-kicker mb-3 text-atlas-gold-main">Portal ATLAS</p>
          <h1 className="atlas-page-title mb-4 text-white">
            Não foi possível carregar os dados públicos do evento
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-atlas-text-muted sm:text-base">
            A página está online, mas os dados do evento não responderam agora. Se você recebeu o link para cadastro, pode acessar o portal de participantes; a comissão usa uma entrada separada e restrita.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/confirmar-interesse"
              className="inline-flex items-center justify-center gap-2 rounded bg-atlas-gold-main px-5 py-3 text-xs font-black uppercase tracking-widest text-atlas-navy-deep transition-colors hover:bg-atlas-gold-dark"
            >
              <UserRoundCheck className="h-4 w-4" />
              Cadastro de Participante
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 rounded border border-atlas-gold-main/40 px-5 py-3 text-xs font-bold uppercase tracking-widest text-atlas-gold-main transition-colors hover:bg-atlas-gold-main/10"
            >
              <ShieldCheck className="h-4 w-4" />
              Acesso da Comissão
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Homepage: no PublicNav/Footer wrapper — EventHero fills 100vh with nav overlaid inside
    <div className="min-h-screen bg-[#060e1c]">
      <EventHero event={event}>
        {/* Stats cards — rendered in the RIGHT column of EventHero */}
        {confirmedCount !== null && (
          <div
            className="group w-full min-w-0 bg-transparent border border-atlas-gold-main/40 backdrop-blur-md px-5 py-5 sm:px-8 rounded-lg shadow-xl
                       transition-all duration-300 hover:border-atlas-gold-main hover:bg-white/5 hover:shadow-atlas-gold-main/20 hover:shadow-2xl
                       cursor-default"
          >
            <p className="atlas-kicker mb-3 text-atlas-gold-main">Confirmados</p>
            <div className="flex items-end gap-2">
              <span className="atlas-feature-value text-white">{confirmedCount}</span>
              <span className="text-atlas-text-muted text-sm mb-1">presenças</span>
            </div>
          </div>
        )}

        {event.mainDate && (
          <Countdown targetDateStr={event.mainDate} compact />
        )}
      </EventHero>
    </div>
  );
}
