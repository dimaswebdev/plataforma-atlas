"use client";

import { Participant } from "@/types/participant";
import Image from "next/image";
import { X, Edit, MapPin, Phone, Mail, AtSign, Globe, Calendar, Briefcase, ShieldCheck, DollarSign, Users, Activity, FileText, CheckCircle, CreditCard } from "lucide-react";
import { calculateAge, formatCurrencyBRL } from "@/lib/utils";

interface ParticipantProfileModalProps {
  participant: Participant;
  onClose: () => void;
  onEdit: () => void;
}

export function ParticipantProfileModal({ participant, onClose, onEdit }: ParticipantProfileModalProps) {
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

  return (
    <div className="fixed inset-0 bg-[#060e1c]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto custom-scrollbar">
      <div className="bg-atlas-navy-deep w-full max-w-4xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative border border-atlas-navy-aero/30 my-auto mt-12 mb-12 sm:mt-16 sm:mb-16">
        
        {/* Header Institucional */}
        <div className="relative bg-gradient-to-r from-[#030712] via-[#0a192f] to-[#030712] border-b border-atlas-gold-main/30 px-8 py-6 rounded-t-2xl overflow-hidden shrink-0">
          {/* Fundo decorativo header */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-gold-main/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-transparent">
                <Image 
                  src="/logo-fab.svg" 
                  alt="Logo FAB" 
                  width={32} 
                  height={32} 
                  style={{ filter: "brightness(0) saturate(100%) invert(77%) sepia(56%) saturate(600%) hue-rotate(3deg) brightness(103%) contrast(97%)" }}
                />
              </div>
              <div>
                <h1 className="text-white font-black tracking-widest uppercase text-lg sm:text-xl">Registro Oficial — Turma ATLAS 30 Anos</h1>
                <p className="text-atlas-gold-main/80 text-xs tracking-[0.2em] font-bold uppercase mt-1">Força Aérea Brasileira | 1997–2027</p>
              </div>
            </div>
            
            <button onClick={onClose} className="text-atlas-text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Dossiê */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gradient-to-b from-atlas-navy-base to-atlas-navy-deep">
          
          {/* Seção 1: Perfil e Resumo */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-white/5 pb-8 mb-8">
            
            {/* Avatar Monograma */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#060e1c] to-[#0a192f] border border-atlas-gold-main/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-atlas-gold-main/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-atlas-gold-main to-white tracking-tighter">
                  {getInitials(participant.name)}
                </span>
              </div>
              <span className="mt-3 text-[9px] font-black tracking-[0.3em] text-atlas-gold-main/70 uppercase">ATLAS</span>
            </div>

            {/* Dados Principais */}
            <div className="flex-1 text-center md:text-left w-full">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-none mb-2">
                {participant.name}
              </h2>
              {participant.nickname && (
                <div className="text-atlas-gold-main font-bold text-lg uppercase tracking-widest mb-4">
                  "{participant.nickname}"
                </div>
              )}
              
              {/* Badges Principais */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {getPresenceBadge()}
                {getStatusBadge()}
                {participant.wantsToHelpCommittee && (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-purple-500/10 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1.5" /> Voluntário
                  </span>
                )}
              </div>

              {/* Faixa de Resumo Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Localidade</div>
                  <div className="text-sm font-semibold text-white truncate">{participant.state || "-"} / {participant.city ? participant.city.substring(0,10) : "-"}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Convidados</div>
                  <div className="text-sm font-semibold text-white">{participant.guestsCount || 0} confirmados</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Status</div>
                  <div className="text-sm font-semibold text-white truncate">{progressPct === 100 ? "Regular" : "Pendente"}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Idade</div>
                  <div className="text-sm font-semibold text-white">{age !== null ? `${age} anos` : "-"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Detalhamento em Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Coluna Esquerda */}
            <div className="space-y-8">
              
              {/* Identificação e Atuação */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <Briefcase className="w-4 h-4 text-atlas-gold-main" />
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Identificação e Atuação</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Profissão Atual / Patente</label>
                    <div className="text-sm text-white font-medium">{participant.currentFunction || "Não informado"}</div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Data de Nascimento</label>
                    <div className="text-sm text-white font-medium">{participant.birthDate ? participant.birthDate.split('-').reverse().join('/') : "Não informado"}</div>
                  </div>
                </div>
              </section>

              {/* Contato */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <Phone className="w-4 h-4 text-atlas-gold-main" />
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Canais de Contato</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded text-atlas-text-muted"><Phone className="w-4 h-4" /></div>
                    <div>
                      <label className="block text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest">WhatsApp / Telefone</label>
                      <div className="text-sm text-white font-medium">{participant.phone}</div>
                    </div>
                  </div>
                  {participant.email && (
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 p-2 rounded text-atlas-text-muted"><Mail className="w-4 h-4" /></div>
                      <div>
                        <label className="block text-[9px] text-atlas-text-muted font-bold uppercase tracking-widest">E-mail</label>
                        <div className="text-sm text-white font-medium">{participant.email}</div>
                      </div>
                    </div>
                  )}
                  {(participant.instagram || participant.linkedin) && (
                    <div className="flex gap-4 mt-2">
                      {participant.instagram && (
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <AtSign className="w-3 h-3 text-atlas-gold-main" />
                          <span className="text-xs text-white">{participant.instagram}</span>
                        </div>
                      )}
                      {participant.linkedin && (
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Globe className="w-3 h-3 text-atlas-gold-main" />
                          <span className="text-xs text-white">{participant.linkedin}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Localização */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <MapPin className="w-4 h-4 text-atlas-gold-main" />
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Localização Atual</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Endereço Completo</label>
                    <div className="text-sm text-white font-medium">{participant.address || "Não informado"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">Cidade/UF</label>
                      <div className="text-sm text-white font-medium">{participant.city || "-"} - {participant.state || "-"}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-atlas-text-muted font-bold uppercase tracking-widest mb-1">CEP</label>
                      <div className="text-sm text-white font-medium">{participant.zipCode || "-"}</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Coluna Direita */}
            <div className="space-y-8">
              
              {/* Participação no Evento */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <Users className="w-4 h-4 text-atlas-gold-main" />
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Participação no Evento</h3>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-sm">Convidados Registrados</h4>
                    <p className="text-xs text-atlas-text-muted mt-1">Dependentes e familiares</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-atlas-gold-main/10 flex items-center justify-center border border-atlas-gold-main/20">
                    <span className="text-xl font-black text-atlas-gold-main">{participant.guestsCount || 0}</span>
                  </div>
                </div>
              </section>

              {/* Financeiro Detalhado */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                  <DollarSign className="w-4 h-4 text-atlas-gold-main" />
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Resumo Financeiro</h3>
                </div>
                
                <div className="bg-gradient-to-br from-[#0a192f] to-[#060e1c] rounded-xl p-6 border border-atlas-gold-main/20 relative overflow-hidden shadow-lg">
                  <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-atlas-gold-main/5 pointer-events-none" />
                  
                  <div className="relative z-10 space-y-5">
                    {/* Valores */}
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] text-atlas-gold-main font-bold uppercase tracking-widest mb-1">Total Pago</div>
                        <div className="text-3xl font-black text-white leading-none">{formatCurrencyBRL(totalPago)}</div>
                        <div className="text-xs text-atlas-text-muted mt-1 font-medium">de {formatCurrencyBRL(totalPrevisto)} previsto</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Pendente</div>
                        <div className="text-lg font-bold text-red-400">{formatCurrencyBRL(saldoPendente)}</div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-atlas-text-muted uppercase tracking-widest">Progresso Financeiro</span>
                        <span className="text-xs font-black text-atlas-gold-main">{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${progressPct >= 100 ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-atlas-gold-main shadow-[0_0_10px_rgba(212,175,55,0.5)]'}`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Observações */}
              {participant.notes && (
                <section>
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                    <FileText className="w-4 h-4 text-atlas-gold-main" />
                    <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Observações da Comissão</h3>
                  </div>
                  <div className="bg-[#030712]/50 rounded-xl p-5 border border-white/5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-atlas-gold-main/50 rounded-l-xl"></div>
                    <p className="text-sm text-atlas-text-light italic leading-relaxed">"{participant.notes}"</p>
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>

        {/* Footer / Ações */}
        <div className="bg-[#030712] border-t border-white/5 p-4 sm:p-6 flex flex-wrap sm:flex-nowrap justify-end items-center gap-3">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-atlas-text-muted hover:text-white transition-colors uppercase tracking-widest border border-transparent hover:border-white/10 rounded-lg order-4 sm:order-1"
          >
            Fechar
          </button>
          
          <button 
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-atlas-text-light/50 bg-white/5 uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-not-allowed order-3 sm:order-2"
            title="Em breve"
          >
            <Users className="w-4 h-4" /> Ver Convidados
          </button>
          
          <button 
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-atlas-text-light/50 bg-white/5 uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-not-allowed order-2 sm:order-3"
            title="Em breve"
          >
            <DollarSign className="w-4 h-4" /> Registrar Pgto
          </button>

          <button 
            onClick={onEdit}
            className="w-full sm:w-auto px-6 py-2.5 bg-atlas-gold-main hover:bg-atlas-gold-dark text-[#060e1c] text-sm font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] order-1 sm:order-4"
          >
            <Edit className="w-4 h-4" /> Editar Cadastro
          </button>
        </div>

      </div>
    </div>
  );
}
