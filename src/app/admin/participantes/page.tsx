"use client";

import { useEffect, useState } from "react";
import { Participant } from "@/types/participant";
import { Users, CheckCircle, XCircle, HelpCircle, Edit, Trash2, Eye, Shirt } from "lucide-react";
import { ParticipantEditForm } from "@/components/admin/ParticipantEditForm";
import { calculateAge, formatCurrencyBRL } from "@/lib/utils";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchWithAdminAuth } from "@/lib/client-auth";

const ADESAO_TITULAR = 0; 
const ADESAO_CONVIDADO = 0; 

export default function AdminParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchWithAdminAuth("/api/data?collection=participants");
      if (!res.ok) throw new Error("Failed to fetch participants");
      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      console.error("Error loading participants", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timeoutId);
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
        const res = await fetchWithAdminAuth(`/api/data?collection=participants&id=${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        await load();
      } catch {
        alert("Erro ao excluir participante.");
      }
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="atlas-admin-title flex items-center text-white">
          <Users className="w-6 h-6 mr-3 text-atlas-gold-main" />
          Lista de Membros
        </h1>
      </div>

      {/* DASHBOARD FINANCEIRO */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        
        {/* Total de Membros Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Users className="w-24 h-24 text-blue-400" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl border border-blue-500/20 shadow-inner">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mb-1">Total de Membros</p>
              <p className="atlas-metric-value text-white">{participants.length}</p>
            </div>
          </div>
        </div>

        {/* Total a Arrecadar Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-atlas-gold-main/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <DollarSign className="w-24 h-24 text-atlas-gold-main" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-atlas-gold-main/20 to-atlas-gold-main/5 rounded-xl border border-atlas-gold-main/20 shadow-inner">
              <DollarSign className="w-6 h-6 text-atlas-gold-main" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-atlas-gold-main uppercase tracking-[0.2em] font-bold mb-1">Total a Arrecadar</p>
              <p className="atlas-metric-value break-words text-white">
                {formatCurrencyBRL(participants.reduce((acc, p) => acc + (ADESAO_TITULAR + (p.guestsCount || 0) * ADESAO_CONVIDADO), 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Arrecadado Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <TrendingUp className="w-24 h-24 text-green-400" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl border border-green-500/20 shadow-inner">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-green-400 uppercase tracking-[0.2em] font-bold mb-1">Arrecadado</p>
              <p className="atlas-metric-value break-words text-white">
                {formatCurrencyBRL(participants.reduce((acc, p) => acc + (p.totalPaid || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Falta Card */}
        <div className="group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-500 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <AlertCircle className="w-24 h-24 text-red-500" />
          </div>
          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl border border-red-500/20 shadow-inner">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-bold mb-1">Falta</p>
              <p className="atlas-metric-value break-words text-white">
                {formatCurrencyBRL(
                  participants.reduce((acc, p) => acc + Math.max(0, (ADESAO_TITULAR + (p.guestsCount || 0) * ADESAO_CONVIDADO) - (p.totalPaid || 0)), 0)
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

      <div className="space-y-3 lg:hidden">
        {loading ? (
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 text-center text-atlas-text-muted">
            Carregando...
          </div>
        ) : participants.length === 0 ? (
          <div className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-6 text-center text-atlas-text-muted">
            Nenhum militar registrado.
          </div>
        ) : (
          participants.map((p) => {
            const age = calculateAge(p.birthDate || "");
            const totalAPagar = ADESAO_TITULAR + (p.guestsCount || 0) * ADESAO_CONVIDADO;
            const totalPago = p.totalPaid || 0;
            const restante = Math.max(0, totalAPagar - totalPago);
            const progressPct = totalAPagar > 0 ? Math.min(100, Math.round((totalPago / totalAPagar) * 100)) : 100;
            const paymentLabel = progressPct >= 100 ? "Pago" : progressPct > 0 ? "Parcial" : "Pendente";
            const paymentClass = progressPct >= 100
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : progressPct > 0
                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                : "border-red-500/40 bg-red-500/10 text-red-400";

            return (
              <article key={p.id} className="rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep p-4 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="atlas-card-title truncate text-white">{p.name}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-atlas-gold-main">{p.nickname || "Sem apelido"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {getStatusIcon(p.willAttend)}
                    <span className="sr-only">{getStatusLabel(p.willAttend)}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-atlas-text-muted">Contato</p>
                    <p className="mt-1 truncate font-semibold text-white">{p.phone || "-"}</p>
                  </div>
                  <div className="rounded border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-atlas-text-muted">Cidade/UF</p>
                    <p className="mt-1 truncate font-semibold text-white">{p.city || "-"} / {p.state || "-"}</p>
                  </div>
                  <div className="rounded border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-atlas-text-muted">Idade</p>
                    <p className="mt-1 font-semibold text-white">{age !== null ? `${age} anos` : "-"}</p>
                  </div>
                  <div className="rounded border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-atlas-text-muted">Conv.</p>
                    <p className="mt-1 font-semibold text-white">{p.guestsCount || 0}</p>
                  </div>
                </div>

                <div className="mt-4 rounded border border-white/5 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${paymentClass}`}>
                      {paymentLabel}
                    </span>
                    <span className="text-xs font-bold text-atlas-gold-main">{progressPct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-white/5 bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-green-400' : progressPct > 0 ? 'bg-atlas-gold-main' : 'bg-red-400'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <p className="uppercase tracking-widest text-atlas-text-muted">Total</p>
                      <p className="font-bold text-atlas-gold-main">{formatCurrencyBRL(totalAPagar)}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-widest text-atlas-text-muted">Pago</p>
                      <p className="font-bold text-green-400">{formatCurrencyBRL(totalPago)}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-widest text-atlas-text-muted">Resta</p>
                      <p className="font-bold text-red-400">{formatCurrencyBRL(restante)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/participantes/${p.id}`}
                    className="rounded-lg border border-white/10 p-2 text-atlas-text-light transition-colors hover:text-white"
                    title="Visualizar DossiÃª"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setEditingParticipant(p)}
                    className="rounded-lg border border-white/10 p-2 text-atlas-text-light transition-colors hover:text-atlas-gold-main"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id!, p.name)}
                    className="rounded-lg border border-white/10 p-2 text-atlas-text-light transition-colors hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep shadow-lg lg:block">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[980px] text-left text-xs text-atlas-text-light">
            <thead className="bg-atlas-navy-base text-atlas-text-muted uppercase tracking-wider text-[10px] border-b border-atlas-navy-aero/30">
              <tr>
                <th className="px-2 py-3 font-semibold">Nome Completo</th>
                <th className="px-2 py-3 font-semibold">Apelido</th>
                <th className="px-2 py-3 font-semibold text-center">Idade</th>
                <th className="px-2 py-3 font-semibold">Contato</th>
                <th className="px-2 py-3 font-semibold hidden lg:table-cell">Cidade</th>
                <th className="px-2 py-3 font-semibold text-center">UF</th>
                <th className="px-2 py-3 font-semibold text-center">Presença</th>
                <th className="px-2 py-3 font-semibold text-center" title="Kit Oficial">Kit</th>
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
                  <td colSpan={15} className="px-6 py-8 text-center text-atlas-text-muted">Carregando...</td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-6 py-8 text-center text-atlas-text-muted">Nenhum militar registrado.</td>
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

                      <td className="px-2 py-3 text-center">
                        {p.officialKit?.interest === 'yes' ? (
                          <span title="Kit: Interesse Confirmado"><Shirt className="w-4 h-4 text-blue-400 mx-auto" /></span>
                        ) : p.officialKit?.interest === 'maybe' ? (
                          <span title="Kit: Talvez"><Shirt className="w-4 h-4 text-yellow-400 mx-auto" /></span>
                        ) : p.officialKit?.interest === 'no' ? (
                          <span title="Kit: Sem Interesse"><Shirt className="w-4 h-4 text-atlas-text-muted mx-auto opacity-50" /></span>
                        ) : (
                          <span title="Kit: Não Respondido"><Shirt className="w-4 h-4 text-atlas-navy-aero mx-auto opacity-30" /></span>
                        )}
                      </td>

                      <td className="px-2 py-3 text-center font-black">{p.guestsCount || 0}</td>
                      <td className="px-2 py-3 text-right font-bold text-atlas-gold-main whitespace-nowrap">{formatCurrencyBRL(totalAPagar)}</td>
                      <td className="px-2 py-3 text-right font-bold text-green-400 whitespace-nowrap">{formatCurrencyBRL(totalPago)}</td>
                      <td className="px-2 py-3 text-right font-bold text-red-400 whitespace-nowrap">{formatCurrencyBRL(restante)}</td>
                      
                      <td className="px-2 py-3 text-center whitespace-nowrap">
                        {getPaymentBadge()}
                      </td>

                      <td className="px-2 py-3 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="text-[9px] font-bold text-atlas-text-muted">{progressPct}%</span>
                          <div className="w-16 bg-white/10 rounded-full h-1.5 border border-white/5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-green-400' : progressPct > 0 ? 'bg-atlas-gold-main' : 'bg-red-400'}`} 
                              style={{ width: `${progressPct}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-2 py-3 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <Link 
                            href={`/admin/participantes/${p.id}`}
                            className="text-atlas-text-light hover:text-white transition-colors"
                            title="Visualizar Dossiê"
                          >
                            <Eye className="w-3 h-3" />
                          </Link>
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
    </div>
  );
}
