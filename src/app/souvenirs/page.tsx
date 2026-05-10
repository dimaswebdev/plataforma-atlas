"use client";

import { useEffect, useState } from "react";
import { getPublicSouvenirs } from "@/data/souvenirs";
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
        const data = await getPublicSouvenirs();
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
        <h1 className="text-xl text-atlas-gold-main uppercase tracking-wider animate-pulse">Carregando...</h1>
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
      <main className="flex-grow py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">

        {souvenirs.length === 0 ? (
          <div className="text-center py-20 text-atlas-text-muted bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30">
            <p>Os souvenirs ainda estão sendo definidos pela comissão organizadora.</p>
            <p className="mt-2 text-sm">Em breve teremos patches, camisetas, canecas e muito mais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
