"use client";

import { useEffect, useState } from "react";
import { getParticipants, updateParticipantPayment, deleteParticipant } from "@/data/participants";
import { Participant } from "@/types/participant";
import { Users, CheckCircle, XCircle, HelpCircle, Edit, Trash2, Eye } from "lucide-react";
import { ParticipantEditForm } from "@/components/admin/ParticipantEditForm";
import { ParticipantProfileModal } from "@/components/admin/ParticipantProfileModal";
import { calculateAge, formatCurrencyBRL } from "@/lib/utils";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";

const ADESAO_TITULAR = 1500; // Valor hipotético titular
const ADESAO_CONVIDADO = 500; // Valor hipotético convidado

export default function AdminParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [viewingParticipant, setViewingParticipant] = useState<Participant | null>(null);

  async function load() {
    setLoading(true);
    const data = await getParticipants();
    setParticipants(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'yes': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'no': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <HelpCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'yes': return 'Confirmado';
      case 'no': return 'Não irá';
      default: return 'Talvez';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja EXCLUIR permanentemente o cadastro de ${name}?`)) {
      try {
        await deleteParticipant(id);
        await load();
      } catch (error) {
        alert("Erro ao excluir participante.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center">
          <Users className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Lista de Membros
        </h1>
      </div>

      {/* DASHBOARD FINANCEIRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 shadow-lg relative overflow-hidden">
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-atlas-gold-main/10" />
          <h3 className="text-xs font-bold text-atlas-text-muted uppercase tracking-wider mb-2">Total a Arrecadar</h3>
          <div className="text-3xl font-black text-white">
            {formatCurrencyBRL(participants.reduce((acc, p) => acc + (ADESAO_TITULAR + (p.guestsCount || 0) * ADESAO_CONVIDADO), 0))}
          </div>
        </div>

        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 shadow-lg relative overflow-hidden border-b-4 border-b-green-500">
          <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-green-500/10" />
          <h3 className="text-xs font-bold text-atlas-text-muted uppercase tracking-wider mb-2">Arrecadado</h3>
          <div className="text-3xl font-black text-green-400">
            {formatCurrencyBRL(participants.reduce((acc, p) => acc + (p.totalPaid || 0), 0))}
          </div>
        </div>

        <div className="bg-atlas-navy-deep p-6 rounded-lg border border-atlas-navy-aero/30 shadow-lg relative overflow-hidden border-b-4 border-b-red-500">
          <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-red-500/10" />
          <h3 className="text-xs font-bold text-atlas-text-muted uppercase tracking-wider mb-2">Falta</h3>
          <div className="text-3xl font-black text-red-400">
            {formatCurrencyBRL(
              Math.max(0, 
                participants.reduce((acc, p) => acc + (ADESAO_TITULAR + (p.guestsCount || 0) * ADESAO_CONVIDADO), 0) - 
                participants.reduce((acc, p) => acc + (p.totalPaid || 0), 0)
              )
            )}
          </div>
        </div>
      </div>

      <div className="bg-atlas-navy-deep rounded-lg border border-atlas-navy-aero/30 shadow-lg overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left text-xs text-atlas-text-light">
            <thead className="bg-atlas-navy-base text-atlas-text-muted uppercase tracking-wider text-[10px] border-b border-atlas-navy-aero/30">
              <tr>
                <th className="px-2 py-3 font-semibold">Nome Completo</th>
                <th className="px-2 py-3 font-semibold">Apelido</th>
                <th className="px-2 py-3 font-semibold text-center">Idade</th>
                <th className="px-2 py-3 font-semibold">Contato</th>
                <th className="px-2 py-3 font-semibold hidden lg:table-cell">Cidade</th>
                <th className="px-2 py-3 font-semibold text-center">UF</th>
                <th className="px-2 py-3 font-semibold text-center">Presença</th>
                <th className="px-2 py-3 font-semibold text-center" title="Convidados">Conv.</th>
                <th className="px-2 py-3 font-semibold text-right">Total a Pagar</th>
                <th className="px-2 py-3 font-semibold text-right">Já Pago</th>
                <th className="px-2 py-3 font-semibold text-right">Restante</th>
                <th className="px-2 py-3 font-semibold text-center">Status</th>
                <th className="px-2 py-3 font-semibold text-center w-24">Progresso</th>
                <th className="px-2 py-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atlas-navy-aero/20">
              {loading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-8 text-center text-atlas-text-muted">Carregando...</td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-6 py-8 text-center text-atlas-text-muted">Nenhum militar registrado.</td>
                </tr>
              ) : (
                participants.map((p) => {
                  const age = calculateAge(p.birthDate || "");
                  
                  const totalAPagar = ADESAO_TITULAR + (p.guestsCount || 0) * ADESAO_CONVIDADO;
                  const totalPago = p.totalPaid || 0;
                  const restante = Math.max(0, totalAPagar - totalPago);
                  const progressPct = totalAPagar > 0 ? Math.min(100, Math.round((totalPago / totalAPagar) * 100)) : 100;

                  const getPaymentBadge = () => {
                    if (progressPct >= 100) return <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Pago</span>;
                    if (progressPct > 0) return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Parcial</span>;
                    return <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Pendente</span>;
                  };

                  return (
                    <tr key={p.id} className="hover:bg-atlas-navy-base/40 transition-colors text-xs border-b border-white/5 last:border-0">
                      <td className="px-2 py-3 font-bold text-white max-w-[250px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="px-2 py-3 text-atlas-gold-main font-bold uppercase tracking-wider truncate max-w-[150px]">{p.nickname || "-"}</td>
                      <td className="px-2 py-3 text-center whitespace-nowrap">{age !== null ? `${age} Anos` : "-"}</td>
                      <td className="px-2 py-3 whitespace-nowrap">{p.phone}</td>
                      <td className="px-2 py-3 hidden lg:table-cell truncate max-w-[150px]">{p.city || "-"}</td>
                      <td className="px-2 py-3 text-center font-bold uppercase">{p.state || "-"}</td>
                      
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(p.willAttend)}
                          <span className="text-[10px] uppercase tracking-wider font-bold hidden xl:inline whitespace-nowrap">{getStatusLabel(p.willAttend)}</span>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center font-black">{p.guestsCount || 0}</td>
                      <td className="px-2 py-3 text-right font-bold text-atlas-gold-main whitespace-nowrap">{formatCurrencyBRL(totalAPagar)}</td>
                      <td className="px-2 py-3 text-right font-bold text-green-400 whitespace-nowrap">{formatCurrencyBRL(totalPago)}</td>
                      <td className="px-2 py-3 text-right font-bold text-red-400 whitespace-nowrap">{formatCurrencyBRL(restante)}</td>
                      
                      <td className="px-2 py-3 text-center whitespace-nowrap">
                        {getPaymentBadge()}
                      </td>

                      <td className="px-2 py-3 text-center">
                        <div className="w-16 mx-auto bg-black/50 rounded-full h-1.5 border border-white/5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-green-400' : progressPct > 0 ? 'bg-atlas-gold-main' : 'bg-red-400'}`} 
                            style={{ width: `${progressPct}%` }} 
                          />
                        </div>
                      </td>
                      
                      <td className="px-2 py-3 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            onClick={() => setViewingParticipant(p)}
                            className="text-atlas-text-light hover:text-white transition-colors"
                            title="Visualizar Perfil"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => setEditingParticipant(p)}
                            className="text-atlas-text-light hover:text-atlas-gold-main transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id!, p.name)}
                            className="text-atlas-text-light hover:text-red-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingParticipant && (
        <ParticipantEditForm 
          participant={editingParticipant} 
          onClose={() => setEditingParticipant(null)} 
          onSuccess={load} 
        />
      )}

      {viewingParticipant && (
        <ParticipantProfileModal 
          participant={viewingParticipant} 
          onClose={() => setViewingParticipant(null)} 
          onEdit={() => {
            setViewingParticipant(null);
            setEditingParticipant(viewingParticipant);
          }}
        />
      )}
    </div>
  );
}
