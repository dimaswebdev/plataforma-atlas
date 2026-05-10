"use client";

import { useEffect, useState } from "react";
import { getPublicSchedule } from "@/data/schedule";
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
        const data = await getPublicSchedule();
        setSchedule(data);
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
      <main className="flex-grow py-12 px-4 md:px-8 max-w-4xl mx-auto w-full">

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-atlas-navy-aero/50 before:to-transparent">
          {schedule.length === 0 ? (
            <div className="text-center py-12 text-atlas-text-muted bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 relative z-10">
              <p>A programação ainda está sendo definida pela comissão organizadora.</p>
            </div>
          ) : (
            schedule.map((item, index) => (
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
