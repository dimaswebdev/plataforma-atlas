"use client";

import { useEffect, useState } from "react";
import { getEventData } from "@/data/events";
import { getConfirmedParticipantsCount } from "@/data/participants";
import { EventHero } from "@/components/public/EventHero";
import { Countdown } from "@/components/public/Countdown";
import { Event } from "@/types/event";

export default function Home() {
  const [event, setEvent] = useState<Event | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventData, count] = await Promise.all([
          getEventData(),
          getConfirmedParticipantsCount()
        ]);
        setEvent(eventData);
        setConfirmedCount(count);
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
        <h1 className="text-xl text-atlas-gold-main uppercase tracking-wider animate-pulse">Carregando Portal...</h1>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-atlas-navy-base">
        <h1 className="text-2xl font-bold text-white mb-4">Evento não encontrado</h1>
        <p className="text-atlas-text-muted">Aguardando configuração inicial no painel administrativo.</p>
      </div>
    );
  }

  return (
    // Homepage: no PublicNav/Footer wrapper — EventHero fills 100vh with nav overlaid inside
    <div className="h-screen overflow-hidden bg-[#060e1c]">
      <EventHero event={event}>
        {/* Stats cards — rendered in the RIGHT column of EventHero */}
        <div
          className="group bg-transparent border border-atlas-gold-main/40 backdrop-blur-md px-8 py-5 rounded-lg shadow-xl
                     transition-all duration-300 hover:border-atlas-gold-main hover:bg-white/5 hover:shadow-atlas-gold-main/20 hover:shadow-2xl
                     min-w-[220px] cursor-default"
        >
          <p className="text-[10px] text-atlas-gold-main uppercase tracking-[0.3em] font-bold mb-3">Confirmados</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white leading-none">{confirmedCount}</span>
            <span className="text-atlas-text-muted text-sm mb-1">presenças</span>
          </div>
        </div>

        {event.mainDate && (
          <Countdown targetDateStr={event.mainDate} compact />
        )}
      </EventHero>
    </div>
  );
}

