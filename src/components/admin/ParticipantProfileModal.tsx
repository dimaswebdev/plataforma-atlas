"use client";

import { Participant } from "@/types/participant";
import { X, Edit, MapPin, Phone, Mail, AtSign, Globe, Calendar, Briefcase, ChevronRight, ShieldCheck, DollarSign } from "lucide-react";
import { calculateAge, formatCurrencyBRL } from "@/lib/utils";

interface ParticipantProfileModalProps {
  participant: Participant;
  onClose: () => void;
  onEdit: () => void;
}

export function ParticipantProfileModal({ participant, onClose, onEdit }: ParticipantProfileModalProps) {
  const age = calculateAge(participant.birthDate || "");
  const META_VALOR = 1500;
  const progressPct = Math.min(100, Math.round(((participant.totalPaid || 0) / META_VALOR) * 100));

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusBadge = () => {
    if (progressPct >= 100) return <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Adesão Paga</span>;
    if (progressPct > 0) return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Adesão Parcial</span>;
    return <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Adesão Pendente</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-atlas-navy-deep w-full max-w-2xl rounded-xl border-2 border-atlas-navy-aero/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {/* Header / ID Card Banner */}
        <div className="relative h-32 bg-atlas-navy-base border-b border-atlas-navy-aero/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-gold-main/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-atlas-text-muted hover:text-white transition-colors z-10 bg-black/20 p-1.5 rounded-full backdrop-blur">
            <X className="w-5 h-5" />
          </button>
          
          <button onClick={onEdit} className="absolute top-4 right-14 text-atlas-gold-main hover:text-atlas-gold-dark transition-colors z-10 bg-black/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur flex items-center">
            <Edit className="w-3 h-3 mr-1" /> Editar
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="flex items-center">
              <ShieldCheck className="w-8 h-8 text-atlas-gold-main opacity-30 mr-2" />
              <span className="text-atlas-gold-main/50 font-bold tracking-[0.2em] uppercase text-sm">Registro Oficial ATLAS</span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 pt-0 relative overflow-y-auto">
          
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row gap-6 -mt-12 relative z-10 items-end sm:items-start border-b border-atlas-navy-aero/20 pb-6 mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-atlas-navy-base border-4 border-atlas-navy-deep flex items-center justify-center shadow-xl overflow-hidden shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-atlas-gold-main">{getInitials(participant.name)}</span>
            </div>
            
            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-14 w-full">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider leading-tight">{participant.name}</h2>
              {participant.nickname && (
                <div className="text-atlas-gold-main font-bold text-sm sm:text-base uppercase tracking-widest mt-1">
                  "{participant.nickname}"
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {participant.willAttend === 'yes' && <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Presença Confirmada</span>}
                {participant.willAttend === 'no' && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Não Irá</span>}
                {participant.willAttend === 'maybe' && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">A Confirmar</span>}
                {getStatusBadge()}
                {participant.wantsToHelpCommittee && <span className="bg-atlas-gold-main/20 text-atlas-gold-main px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-atlas-gold-main/30 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Voluntário Comissão</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Professional */}
              <div>
                <h3 className="text-xs font-black text-atlas-gold-main uppercase tracking-[0.15em] border-b border-atlas-navy-aero/20 pb-2 mb-3 flex items-center">
                  <Briefcase className="w-3 h-3 mr-2" /> Atuação Profissional
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-atlas-text-muted mr-1 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase text-atlas-text-muted font-bold tracking-wider">Profissão / Patente</div>
                      <div className="text-sm text-white">{participant.currentFunction || "Não informado"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal */}
              <div>
                <h3 className="text-xs font-black text-atlas-gold-main uppercase tracking-[0.15em] border-b border-atlas-navy-aero/20 pb-2 mb-3 flex items-center">
                  <Calendar className="w-3 h-3 mr-2" /> Dados Pessoais
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-atlas-text-muted mr-1 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase text-atlas-text-muted font-bold tracking-wider">Nascimento / Idade</div>
                      <div className="text-sm text-white">
                        {participant.birthDate ? `${participant.birthDate.split('-').reverse().join('/')} ` : "Não informado "}
                        {age !== null && <span className="text-atlas-gold-main text-xs">({age} Anos)</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-black text-atlas-gold-main uppercase tracking-[0.15em] border-b border-atlas-navy-aero/20 pb-2 mb-3 flex items-center">
                  <Phone className="w-3 h-3 mr-2" /> Contato
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 text-atlas-text-muted mr-2 mt-0.5 shrink-0" />
                    <div className="text-sm text-white">{participant.phone}</div>
                  </div>
                  {participant.email && (
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 text-atlas-text-muted mr-2 mt-0.5 shrink-0" />
                      <div className="text-sm text-white">{participant.email}</div>
                    </div>
                  )}
                  {participant.instagram && (
                    <div className="flex items-start">
                      <AtSign className="w-4 h-4 text-atlas-text-muted mr-2 mt-0.5 shrink-0" />
                      <div className="text-sm text-white">{participant.instagram}</div>
                    </div>
                  )}
                  {participant.linkedin && (
                    <div className="flex items-start">
                      <Globe className="w-4 h-4 text-atlas-text-muted mr-2 mt-0.5 shrink-0" />
                      <div className="text-sm text-white">{participant.linkedin}</div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Location */}
              <div>
                <h3 className="text-xs font-black text-atlas-gold-main uppercase tracking-[0.15em] border-b border-atlas-navy-aero/20 pb-2 mb-3 flex items-center">
                  <MapPin className="w-3 h-3 mr-2" /> Localização
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-atlas-text-muted mr-1 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase text-atlas-text-muted font-bold tracking-wider">Endereço</div>
                      <div className="text-sm text-white">
                        {participant.address || "Não informado"}
                        {participant.zipCode && <span className="block text-xs text-atlas-text-muted">CEP: {participant.zipCode}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-atlas-text-muted mr-1 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase text-atlas-text-muted font-bold tracking-wider">Cidade / Estado / País</div>
                      <div className="text-sm text-white">
                        {participant.city} - {participant.state} 
                        {participant.country && ` (${participant.country})`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="text-xs font-black text-atlas-gold-main uppercase tracking-[0.15em] border-b border-atlas-navy-aero/20 pb-2 mb-3 flex items-center">
                  <Calendar className="w-3 h-3 mr-2" /> Participação no Evento
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-atlas-navy-base p-3 rounded border border-atlas-navy-aero/20">
                    <span className="text-xs uppercase text-atlas-text-muted font-bold">Convidados</span>
                    <span className="text-lg font-black text-white">{participant.guestsCount}</span>
                  </div>

                  {/* Financial Mini-Dashboard */}
                  <div className="bg-atlas-navy-base p-4 rounded border border-atlas-navy-aero/20 relative overflow-hidden">
                    <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-atlas-gold-main/5" />
                    <div className="relative z-10">
                      <div className="text-xs uppercase text-atlas-text-muted font-bold mb-1">Status Financeiro</div>
                      <div className="text-2xl font-black text-white mb-3">{formatCurrencyBRL(participant.totalPaid || 0)}</div>
                      
                      <div className="w-full">
                        <div className="flex justify-between text-[10px] mb-1 text-atlas-text-muted font-bold">
                          <span>Adesão Total</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-atlas-navy-deep rounded-full overflow-hidden border border-atlas-navy-aero/20">
                          <div 
                            className={`h-full transition-all duration-500 ${progressPct >= 100 ? 'bg-green-500' : 'bg-atlas-gold-main'}`} 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {participant.notes && (
            <div className="mt-6 p-4 bg-atlas-navy-base/50 rounded-lg border border-atlas-navy-aero/20">
              <h3 className="text-xs font-black text-atlas-gold-main uppercase tracking-[0.15em] mb-2">Observações / Notas</h3>
              <p className="text-sm text-atlas-text-light italic">"{participant.notes}"</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
