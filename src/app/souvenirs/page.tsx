"use client";

import { useEffect, useState } from "react";
import { SouvenirCard } from "@/components/public/SouvenirCard";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Souvenir } from "@/types/souvenir";
import { PageHeader } from "@/components/public/PageHeader";

export default function SouvenirsPage() {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/data?collection=souvenirs");
        if (!res.ok) throw new Error("Failed to fetch souvenirs");
        const data = await res.json();
        setSouvenirs(data);
      } catch (err) {
        console.error("Error loading souvenirs", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-atlas-navy-base">
        <div className="atlas-loading-label animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/bg-souvenirs.png"
        accent="Loja Oficial"
        title="Souvenirs Oficiais"
        subtitle="Itens comemorativos dos 30 anos da Turma ATLAS. Clique em &lsquo;Tenho Interesse&rsquo; para solicitar via WhatsApp."
      />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 md:px-8 md:py-12">

        {souvenirs.length === 0 ? (
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep px-4 py-14 text-center text-atlas-text-muted sm:py-20">
            <p>Os souvenirs ainda estão sendo definidos pela comissão organizadora.</p>
            <p className="mt-2 text-sm">Em breve teremos patches, camisetas, canecas e muito mais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {souvenirs.map((souvenir) => (
              <SouvenirCard key={souvenir.id} souvenir={souvenir} />
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
