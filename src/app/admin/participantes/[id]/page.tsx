"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Participant } from "@/types/participant";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { 
  X, Edit, MapPin, Phone, Mail, AtSign, Globe, Calendar, Briefcase, 
  DollarSign, Users, Activity, FileText, CheckCircle, CreditCard, 
  ArrowLeft, Shirt, Scissors, Ruler, Loader2
} from "lucide-react";
import { calculateAge, formatCurrencyBRL } from "@/lib/utils";

export default function ParticipantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParticipant() {
      if (!params.id) return;
      try {
        const docRef = doc(db, "events", DEFAULT_EVENT_ID, "participants", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setParticipant({ id: docSnap.id, ...docSnap.data() } as Participant);
        } else {
          router.push("/admin/participantes");
        }
      } catch (error) {
        console.error("Failed to load participant", error);
      } finally {
        setLoading(false);
      }
    }
    loadParticipant();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-atlas-gold-main animate-spin" />
          <div className="text-atlas-gold-main text-sm font-bold animate-pulse tracking-widest uppercase">Carregando Dossiê...</div>
        </div>
      </div>
    );
  }

  if (!participant) return null;

  const age = calculateAge(participant.birthDate || "");
  const ADESAO_TITULAR = 1500;
  const ADESAO_CONVIDADO = 500;
  const totalPrevisto = ADESAO_TITULAR + (participant.guestsCount || 0) * ADESAO_CONVIDADO;
  const totalPago = participant.totalPaid || 0;
  const saldoPendente = Math.max(0, totalPrevisto - totalPago);
  const progressPct = totalPrevisto > 0 ? Math.min(100, Math.round((totalPago / totalPrevisto) * 100)) : 100;

  // Get Initials for Avatar Monogram
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusBadge = () => {
    if (progressPct >= 100) return <span className="bg-green-500/10 text-green-400 border border-green-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-green-500/10">Adesão Paga</span>;
    if (progressPct > 0) return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-yellow-500/10">Adesão Parcial</span>;
    return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-red-500/10">Pendente</span>;
  };

  const getPresenceBadge = () => {
    switch(participant.willAttend) {
      case 'yes': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-blue-500/10">Presença Confirmada</span>;
      case 'no': return <span className="bg-gray-500/10 text-gray-400 border border-gray-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-gray-500/10">Ausente</span>;
      default: return <span className="bg-atlas-gold-main/10 text-atlas-gold-main border border-atlas-gold-main/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-atlas-gold-main/10">A Confirmar</span>;
    }
  };

  const kit = participant.officialKit;
  const hasKitInterest = kit?.interest === "yes" || kit?.interest === "maybe";

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      
      {/* Top Bar Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/admin/participantes"
          className="flex items-center gap-2 text-atlas-text-muted hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar para Lista</span>
        </Link>
        <button 
          onClick={() => { /* will open edit form logic */ }}
          className="px-4 py-2 bg-atlas-gold-main/10 hover:bg-atlas-gold-main/20 text-atlas-gold-main text-xs font-black uppercase tracking-widest rounded flex items-center gap-2 transition-all border border-atlas-gold-main/20"
        >
          <Edit className="w-3 h-3" /> Editar (Em breve)
        </button>
      </div>

      {/* Dossiê Container */}
      <div className="bg-atlas-navy-deep w-full rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative border border-atlas-navy-aero/30 overflow-hidden">
        
        {/* Header Institucional */}
        <div className="relative bg-gradient-to-r from-[#030712] via-[#0a192f] to-[#030712] border-b border-atlas-gold-main/30 px-6 sm:px-10 py-8 overflow-hidden shrink-0">
          {/* Fundo decorativo header */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-atlas-gold-main/5 rounded-full -mr-32 -mt-48 blur-[80px] pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-transparent">
                <Image 
                  src="/logo-fab.svg" 
                  alt="Logo FAB" 
                  width={48} 
                  height={48} 
                  style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
                />
              </div>
              <div>
                <h1 className="text-white font-black tracking-widest uppercase text-xl sm:text-2xl">Registro Oficial — Turma ATLAS 30 Anos</h1>
                <p className="text-atlas-gold-main/80 text-xs sm:text-sm tracking-[0.2em] font-bold uppercase mt-1">Força Aérea Brasileira | 1997–2027</p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">ID do Registro</div>
              <div className="text-sm font-mono text-white/50">{participant.id}</div>
            </div>
          </div>
        </div>

        {/* Corpo do Dossiê */}
        <div className="flex-1 p-6 sm:p-10 bg-gradient-to-b from-atlas-navy-base to-atlas-navy-deep">
          
          {/* Seção 1: Perfil e Resumo */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-white/5 pb-10 mb-10">
            
            {/* Avatar Monograma */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-[#060e1c] to-[#0a192f] border border-atlas-gold-main/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-atlas-gold-main/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-atlas-gold-main to-white tracking-tighter">
                  {getInitials(participant.name)}
                </span>
              </div>
              <span className="mt-4 text-[10px] sm:text-xs font-black tracking-[0.3em] text-atlas-gold-main/70 uppercase">ATLAS</span>
            </div>

            {/* Dados Principais */}
            <div className="flex-1 text-center md:text-left w-full mt-4 md:mt-0">
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
                {participant.name}
              </h2>
              {participant.nickname && (
                <div className="text-atlas-gold-main font-bold text-xl sm:text-2xl uppercase tracking-widest mb-6">
                  "{participant.nickname}"
                </div>
              )}
              
              {/* Badges Principais */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                {getPresenceBadge()}
                {getStatusBadge()}
                {participant.wantsToHelpCommittee && (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-purple-500/10 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1.5" /> Voluntário
                  </span>
                )}
                {kit?.interest === "yes" && (
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-blue-500/10 flex items-center">
                    <Shirt className="w-3 h-3 mr-1.5" /> Kit Oficial Solicitado
                  </span>
                )}
              </div>

              {/* Faixa de Resumo Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                  <div className="text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Localidade</div>
                  <div className="text-sm sm:text-base font-semibold text-white truncate">{participant.state || "-"} / {participant.city ? participant.city.substring(0,10) : "-"}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                  <div className="text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Convidados</div>
                  <div className="text-sm sm:text-base font-semibold text-white">{participant.guestsCount || 0} confirmados</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                  <div className="text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Status</div>
                  <div className="text-sm sm:text-base font-semibold text-white truncate">{progressPct === 100 ? "Regular" : "Pendente"}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
                  <div className="text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Idade</div>
                  <div className="text-sm sm:text-base font-semibold text-white">{age !== null ? `${age} anos` : "-"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Seções */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
            
            {/* Coluna Esquerda */}
            <div className="space-y-10">
              
              {/* Identificação e Atuação */}
              <section>
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <Briefcase className="w-5 h-5 text-atlas-gold-main" />
                  <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Identificação e Atuação</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Profissão Atual / Patente</label>
                    <div className="text-base text-white font-medium">{participant.currentFunction || "Não informado"}</div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Data de Nascimento</label>
                    <div className="text-base text-white font-medium">{participant.birthDate ? participant.birthDate.split('-').reverse().join('/') : "Não informado"}</div>
                  </div>
                </div>
              </section>

              {/* Contato */}
              <section>
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <Phone className="w-5 h-5 text-atlas-gold-main" />
                  <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Canais de Contato</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-lg text-atlas-text-muted"><Phone className="w-5 h-5" /></div>
                    <div>
                      <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">WhatsApp / Telefone</label>
                      <div className="text-base text-white font-medium">{participant.phone}</div>
                    </div>
                  </div>
                  {participant.email && (
                    <div className="flex items-center gap-4">
                      <div className="bg-white/5 p-3 rounded-lg text-atlas-text-muted"><Mail className="w-5 h-5" /></div>
                      <div>
                        <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">E-mail</label>
                        <div className="text-base text-white font-medium">{participant.email}</div>
                      </div>
                    </div>
                  )}
                  {(participant.instagram || participant.linkedin) && (
                    <div className="flex gap-4 mt-4">
                      {participant.instagram && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner">
                          <AtSign className="w-4 h-4 text-atlas-gold-main" />
                          <span className="text-sm text-white font-medium">{participant.instagram}</span>
                        </div>
                      )}
                      {participant.linkedin && (
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner">
                          <Globe className="w-4 h-4 text-atlas-gold-main" />
                          <span className="text-sm text-white font-medium">{participant.linkedin}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Localização */}
              <section>
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <MapPin className="w-5 h-5 text-atlas-gold-main" />
                  <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Localização Atual</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Endereço Completo</label>
                    <div className="text-base text-white font-medium">{participant.address || "Não informado"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Cidade/UF</label>
                      <div className="text-base text-white font-medium">{participant.city || "-"} - {participant.state || "-"}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">CEP</label>
                      <div className="text-base text-white font-medium">{participant.zipCode || "-"}</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Coluna Direita */}
            <div className="space-y-10">
              
              {/* Kit Oficial ATLAS */}
              <section>
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <Shirt className="w-5 h-5 text-atlas-gold-main" />
                  <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Kit Oficial ATLAS 30 Anos</h3>
                </div>
                
                {hasKitInterest ? (
                  <div className="bg-gradient-to-br from-[#0a192f] to-atlas-navy-deep rounded-xl p-6 border border-atlas-navy-aero/30 shadow-lg relative overflow-hidden">
                    <Scissors className="absolute -right-4 -top-4 w-32 h-32 text-white/5 pointer-events-none" />
                    
                    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 p-3 rounded border border-white/5">
                        <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Camiseta</div>
                        <div className="text-lg text-white font-black">{kit?.shirtSize || "-"}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/5">
                        <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Jaqueta</div>
                        <div className="text-lg text-white font-black">{kit?.jacketSize || "-"}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/5">
                        <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Calça</div>
                        <div className="text-lg text-white font-black">{kit?.pantsSize || "-"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 border-t border-white/5 pt-4">
                      {kit?.heightCm && (
                        <div>
                          <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Ruler className="w-3 h-3"/> Altura</div>
                          <div className="text-sm text-white font-medium">{kit.heightCm} cm</div>
                        </div>
                      )}
                      {kit?.approximateWeightKg && (
                        <div>
                          <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Peso Aprox.</div>
                          <div className="text-sm text-white font-medium">{kit.approximateWeightKg} kg</div>
                        </div>
                      )}
                    </div>

                    {kit?.wantsNameCustomization && kit?.customizationName && (
                      <div className="bg-atlas-gold-main/10 p-4 rounded-lg border border-atlas-gold-main/20 mb-4">
                        <div className="text-[10px] text-atlas-gold-main font-bold uppercase tracking-widest mb-1">Nome para Personalização</div>
                        <div className="text-xl font-mono tracking-widest text-white uppercase">"{kit.customizationName}"</div>
                      </div>
                    )}
                    
                    {(kit?.needsSpecialSize || kit?.notes) && (
                      <div className="bg-black/20 p-4 rounded-lg text-sm text-atlas-text-light">
                        {kit.needsSpecialSize && <span className="block mb-2 font-bold text-yellow-500">⚠️ Solicitou tamanho especial / sob medida.</span>}
                        {kit.notes && <span className="italic">"{kit.notes}"</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/5 text-center">
                    <p className="text-atlas-text-muted text-sm font-medium">Sem interesse no Kit Oficial ({kit?.interest === "no" ? "Recusado" : "Não preenchido"}).</p>
                  </div>
                )}
              </section>

              {/* Financeiro Detalhado */}
              <section>
                <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                  <DollarSign className="w-5 h-5 text-atlas-gold-main" />
                  <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Resumo Financeiro</h3>
                </div>
                
                <div className="bg-gradient-to-br from-[#0a192f] to-[#060e1c] rounded-xl p-8 border border-atlas-gold-main/20 relative overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.05)]">
                  <CreditCard className="absolute -right-6 -bottom-6 w-40 h-40 text-atlas-gold-main/5 pointer-events-none" />
                  
                  <div className="relative z-10 space-y-6">
                    {/* Valores */}
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] text-atlas-gold-main font-bold uppercase tracking-widest mb-1">Total Pago</div>
                        <div className="text-4xl font-black text-white leading-none">{formatCurrencyBRL(totalPago)}</div>
                        <div className="text-sm text-atlas-text-muted mt-2 font-medium">de {formatCurrencyBRL(totalPrevisto)} previsto</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Pendente</div>
                        <div className="text-2xl font-bold text-red-400">{formatCurrencyBRL(saldoPendente)}</div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-atlas-text-muted uppercase tracking-widest">Progresso Financeiro</span>
                        <span className="text-sm font-black text-atlas-gold-main">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${progressPct >= 100 ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-atlas-gold-main shadow-[0_0_10px_rgba(212,175,55,0.5)]'}`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Observações da Comissão */}
              {participant.notes && (
                <section>
                  <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                    <FileText className="w-5 h-5 text-atlas-gold-main" />
                    <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Observações da Comissão</h3>
                  </div>
                  <div className="bg-[#030712]/50 rounded-xl p-6 border border-white/5 relative shadow-inner">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-atlas-gold-main/50 rounded-l-xl"></div>
                    <p className="text-base text-atlas-text-light italic leading-relaxed">"{participant.notes}"</p>
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
