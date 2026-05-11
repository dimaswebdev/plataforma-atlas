"use client";

import { useState } from "react";
import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import Link from "next/link";

export default function SeedPage() {
  const [status, setStatus] = useState("Pronto para rodar o script de Seed.");
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState("");

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atlas-navy-base p-8 text-white text-center">
        <div className="max-w-md w-full bg-atlas-navy-deep p-8 rounded border border-atlas-navy-aero/30 shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-atlas-gold-main uppercase tracking-wider">Configuração Inicial Desativada</h1>
          <p className="text-atlas-text-muted text-sm">
            Esta rota é bloqueada em produção para proteger a configuração do evento. Use o painel administrativo ou o Firebase Console para ajustes.
          </p>
        </div>
      </div>
    );
  }

  async function handleSeed() {
    if (!db) {
      setStatus("Erro: Firebase não inicializado corretamente.");
      return;
    }
    
    setLoading(true);
    setStatus("1/4: Iniciando conexão com Firestore...");
    console.log("Firebase Config:", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    });

    const timeoutId = setTimeout(() => {
      if (loading) {
        setStatus("ERRO: Tempo esgotado (Timeout). O Firebase não respondeu a tempo.");
        setLoading(false);
      }
    }, 15000);

    try {
      // 1. Create Event
      setStatus("1/4: Criando documento principal do evento...");
      console.log("Step 1: Creating event doc...");
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
        setStatus("1.5/4: Registrando seu usuário como Administrador...");
        console.log("Step 1.5: Adding admin...");
        await setDoc(doc(db, "events", DEFAULT_EVENT_ID, "admins", uid.trim()), {
          uid: uid.trim(),
          email: "admin@atlas.com",
          role: "owner"
        });
      }

      // 2. Clear Existing Schedule (if any) and Create New Initial Schedule
      setStatus("2/4: Configurando cronograma inicial...");
      console.log("Step 2: Schedule...");
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
      setStatus("3/4: Cadastrando souvenirs iniciais...");
      console.log("Step 3: Souvenirs...");
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

      setStatus("4/4: Seed finalizado com sucesso!");
      console.log("Seed Success!");
      clearTimeout(timeoutId);
    } catch (error: unknown) {
      console.error("Seed Error:", error);
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setStatus("ERRO: " + message);
      clearTimeout(timeoutId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-atlas-navy-base p-8 text-white text-center">
      <div className="max-w-md w-full bg-atlas-navy-deep p-8 rounded border border-atlas-navy-aero/30 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-atlas-gold-main uppercase tracking-wider">Configuração Inicial</h1>
        <p className="text-atlas-text-muted text-sm mb-6">
          Cole abaixo o &quot;User UID&quot; que você acabou de criar no painel do Firebase para que o sistema te cadastre como o Administrador Principal.
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
          disabled={loading}
          className="w-full py-3 bg-atlas-gold-main text-atlas-navy-deep font-bold uppercase tracking-widest rounded disabled:opacity-50 hover:bg-atlas-gold-dark transition"
        >
          {loading ? "Processando..." : "Rodar Seed do Firebase"}
        </button>

        {status.includes("sucesso") && (
          <Link href="/" className="block mt-4 text-sm text-atlas-navy-aero hover:text-white underline">
            Voltar para a Home
          </Link>
        )}

        {/* Debug Info */}
        <div className="mt-8 pt-6 border-t border-white/10 text-left">
          <p className="text-[10px] text-atlas-navy-aero uppercase tracking-widest mb-2">Debug Info (Vercel Config)</p>
          <div className="space-y-1 font-mono text-[10px] text-atlas-text-muted">
            <p>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 8)}...` : "NÃO CARREGADO"}</p>
            <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NÃO CARREGADO"}</p>
            <p>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "NÃO CARREGADO"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
