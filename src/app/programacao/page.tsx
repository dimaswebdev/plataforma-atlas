"use client";

import { useEffect, useState } from "react";
import { ScheduleCard } from "@/components/public/ScheduleCard";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PageHeader } from "@/components/public/PageHeader";
import { Schedule } from "@/types/schedule";

export default function ProgramacaoPage() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/data?collection=schedule");
        if (!res.ok) throw new Error("Failed to fetch schedule");
        const data = await res.json();
        // Filter public items manually or update API to handle it
        setSchedule((data as Schedule[]).filter((item) => item.isPublic !== false));
      } catch (err) {
        console.error("Error loading schedule", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-atlas-navy-base">
        <h1 className="text-xl text-atlas-gold-main uppercase tracking-wider animate-pulse">Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/bg-programacao.png"
        accent="Turma ATLAS 30 Anos"
        title="Programação Oficial"
        subtitle="Confira o cronograma de eventos para o Reencontro de 30 Anos da Turma ATLAS. As informações podem ser atualizadas pela comissão."
      />
      <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">

        <div className="relative space-y-5 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-atlas-navy-aero/50 before:to-transparent sm:space-y-6 md:before:mx-auto md:before:translate-x-0">
          {schedule.length === 0 ? (
            <div className="text-center py-12 text-atlas-text-muted bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 relative z-10">
              <p>A programação ainda está sendo definida pela comissão organizadora.</p>
            </div>
          ) : (
            schedule.map((item) => (
              <div key={item.id} className="relative z-10">
                <ScheduleCard schedule={item} />
              </div>
            ))
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
