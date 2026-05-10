"use client";

import { useState } from "react";
import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_EVENT_ID } from "@/lib/constants";

export default function SeedPage() {
  const [status, setStatus] = useState("Pronto para rodar o script de Seed.");
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState("");

  async function handleSeed() {
    setLoading(true);
    setStatus("Executando seed no banco de dados...");

    try {
      // 1. Create Event
      await setDoc(doc(db, "events", DEFAULT_EVENT_ID), {
        title: "Reencontro 30 Anos — Turma ATLAS",
        subtitle: "Força Aérea Brasileira | 1997–2027",
        city: "Campo Grande/MS",
        eventMonth: "Março",
        eventYear: 2027,
        mainDate: "2027-03-20T10:00:00",
        status: "planning",
        budgetGoal: 110000,
        heroDescription: "Três décadas de histórias, missões, amizades e memórias. O Portal ATLAS reúne as informações oficiais do reencontro de 30 anos da turma, com programação, prestação de contas, souvenirs, orientações para quem vem de fora e comunicados da comissão organizadora.",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 1.5 Create Admin if UID is provided
      if (uid.trim()) {
        await setDoc(doc(db, "events", DEFAULT_EVENT_ID, "admins", uid.trim()), {
          uid: uid.trim(),
          email: "admin@atlas.com",
          role: "owner"
        });
      }

      // 2. Clear Existing Schedule (if any) and Create New Initial Schedule
      const scheduleRef = collection(db, "events", DEFAULT_EVENT_ID, "schedule");
      const existingSchedule = await getDocs(scheduleRef);
      for (const d of existingSchedule.docs) {
        await deleteDoc(d.ref);
      }

      const s1 = doc(scheduleRef, "event-1");
      await setDoc(s1, {
        title: "Recepção dos integrantes que vêm de fora",
        description: "Momento informal de acolhimento aos integrantes da Turma ATLAS que chegarão a Campo Grande/MS.",
        date: "A definir (Março 2027)",
        startTime: "19:00",
        order: 1,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const s2 = doc(scheduleRef, "event-2");
      await setDoc(s2, {
        title: "Visita à Base Aérea de Campo Grande",
        description: "Prestar a última continência ao terreno. Momento nostálgico e institucional na BACG.",
        date: "A definir (Março 2027)",
        startTime: "09:00",
        order: 2,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const s3 = doc(scheduleRef, "event-3");
      await setDoc(s3, {
        title: "Encontro oficial Turma ATLAS 30 Anos",
        description: "Evento principal de celebração dos 30 anos da Turma ATLAS, com confraternização, homenagens, registros fotográficos e programação especial.",
        date: "A definir (Março 2027)",
        startTime: "20:00",
        order: 3,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const s4 = doc(scheduleRef, "event-4");
      await setDoc(s4, {
        title: "Almoço de confraternização e despedida",
        description: "Momento final de confraternização entre integrantes, familiares e convidados.",
        date: "A definir (Março 2027)",
        startTime: "12:00",
        order: 4,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 3. Create Initial Souvenirs
      const souvenirsRef = collection(db, "events", DEFAULT_EVENT_ID, "souvenirs");
      await setDoc(doc(souvenirsRef), {
        name: "Patch Bordado ATLAS 30 Anos",
        description: "Patch em alta definição comemorativo dos 30 anos.",
        price: 35.0,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await setDoc(doc(souvenirsRef), {
        name: "Camiseta Oficial Turma ATLAS",
        description: "Camiseta dry-fit com emblema da Turma ATLAS.",
        price: 90.0,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await setDoc(doc(souvenirsRef), {
        name: "Caneca Comemorativa 1997–2027",
        description: "Caneca de cerâmica 325ml.",
        price: 45.0,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setStatus("Seed finalizado com sucesso! Seu usuário foi promovido a Administrador.");
    } catch (error: any) {
      console.error(error);
      setStatus("Erro ao rodar seed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-atlas-navy-base p-8 text-white text-center">
      <div className="max-w-md w-full bg-atlas-navy-deep p-8 rounded border border-atlas-navy-aero/30 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-atlas-gold-main uppercase tracking-wider">Configuração Inicial</h1>
        <p className="text-atlas-text-muted text-sm mb-6">
          Cole abaixo o "User UID" que você acabou de criar no painel do Firebase para que o sistema te cadastre como o Administrador Principal.
        </p>

        <input 
          type="text" 
          placeholder="Cole seu UID aqui..." 
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-3 text-white mb-6 focus:outline-none focus:border-atlas-gold-main text-center font-mono"
        />
        
        <div className="bg-atlas-navy-base p-4 rounded text-sm text-left font-mono border border-atlas-navy-aero/50 mb-8 overflow-hidden break-words text-atlas-text-light">
          {status}
        </div>

        <button 
          onClick={handleSeed} 
          disabled={loading || !uid.trim()}
          className="w-full py-3 bg-atlas-gold-main text-atlas-navy-deep font-bold uppercase tracking-widest rounded disabled:opacity-50 hover:bg-atlas-gold-dark transition"
        >
          {loading ? "Processando..." : "Rodar Seed do Firebase"}
        </button>

        {status.includes("sucesso") && (
          <a href="/" className="block mt-4 text-sm text-atlas-navy-aero hover:text-white underline">
            Voltar para a Home
          </a>
        )}
      </div>
    </div>
  );
}
