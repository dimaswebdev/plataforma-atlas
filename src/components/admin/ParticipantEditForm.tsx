"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Participant } from "@/types/participant";
import { X, Save } from "lucide-react";
import { capitalizeName, formatPhone, formatZipCode } from "@/lib/utils";
import { fetchWithAdminAuth } from "@/lib/client-auth";

interface ParticipantEditFormProps {
  participant: Participant;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParticipantEditForm({ participant, onClose, onSuccess }: ParticipantEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kitInterest, setKitInterest] = useState<string>(participant.officialKit?.interest || "");

  const [phoneInput, setPhoneInput] = useState(participant.phone || "");
  const [zipInput, setZipInput] = useState(participant.zipCode || "");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      setPhoneInput(formatPhone(val));
    } else {
      setPhoneInput(e.target.value);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 8) {
      setZipInput(formatZipCode(val));
    } else {
      setZipInput(e.target.value);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const rawName = formData.get("name") as string;
    const rawNickname = formData.get("nickname") as string;
    const rawCity = formData.get("city") as string;
    const rawFunction = formData.get("currentFunction") as string;

    try {
      const totalPaid = Number(formData.get("totalPaid") || 0);
      let paymentStatus: "not_started" | "partial" | "paid" | "overdue" = "not_started";
      const META_VALOR = 0;
      
      if (totalPaid >= META_VALOR) {
        paymentStatus = "paid";
      } else if (totalPaid > 0) {
        paymentStatus = "partial";
      }

      const payload = {
        name: capitalizeName(rawName),
        nickname: rawNickname ? capitalizeName(rawNickname) : "",
        email: (formData.get("email") as string).toLowerCase(),
        phone: formatPhone(formData.get("phone") as string),
        instagram: formData.get("instagram") as string,
        linkedin: formData.get("linkedin") as string,
        birthDate: formData.get("birthDate") as string,
        currentFunction: rawFunction ? capitalizeName(rawFunction) : "",
        zipCode: formatZipCode(formData.get("zipCode") as string),
        address: formData.get("address") as string,
        city: rawCity ? capitalizeName(rawCity) : "",
        state: (formData.get("state") as string).toUpperCase(),
        country: (formData.get("country") as string).toUpperCase(),
        willAttend: formData.get("willAttend") as "yes" | "maybe" | "no",
        guestsCount: Number(formData.get("guestsCount") || 0),
        wantsToHelpCommittee: formData.get("wantsToHelpCommittee") === "on",
        totalPaid: totalPaid,
        paymentStatus: paymentStatus,
        notes: formData.get("notes") as string,
        officialKit: kitInterest ? {
          interest: kitInterest as "yes" | "maybe" | "no",
          shirtSize: (formData.get("kitShirtSize") as string) || undefined,
          jacketSize: (formData.get("kitJacketSize") as string) || undefined,
          pantsSize: (formData.get("kitPantsSize") as string) || undefined,
          heightCm: formData.get("kitHeightCm") ? Number(formData.get("kitHeightCm")) : undefined,
          approximateWeightKg: formData.get("kitWeightKg") ? Number(formData.get("kitWeightKg")) : undefined,
          needsSpecialSize: formData.get("kitNeedsSpecialSize") === "on",
          wantsNameCustomization: formData.get("kitWantsCustomization") === "on",
          customizationName: (formData.get("kitCustomizationName") as string) || undefined,
          notes: (formData.get("kitNotes") as string) || undefined,
        } : null
      };

      const res = await fetchWithAdminAuth(`/api/data?collection=participants&id=${participant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError("Erro ao atualizar participante: " + message);
      setLoading(false);
    }
  }

  const modal = (
    <div className="atlas-admin-modal fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/75 p-3 py-4 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-edit-title"
        className="atlas-modal-panel my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-atlas-navy-aero/30 bg-atlas-navy-deep shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-atlas-navy-aero/30 bg-atlas-navy-base p-4">
          <h2 id="participant-edit-title" className="atlas-section-title text-white">Editar Participante</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white" aria-label="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Nome</label>
                <input type="text" name="name" defaultValue={participant.name} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Apelido</label>
                <input type="text" name="nickname" defaultValue={participant.nickname} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Telefone</label>
                <input type="text" name="phone" value={phoneInput} onChange={handlePhoneChange} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">E-mail</label>
                <input type="email" name="email" defaultValue={participant.email} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Instagram</label>
                <input type="text" name="instagram" defaultValue={participant.instagram} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">LinkedIn</label>
                <input type="text" name="linkedin" defaultValue={participant.linkedin} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Nascimento</label>
                <input type="date" name="birthDate" defaultValue={participant.birthDate} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Profissão Atual</label>
                <input type="text" name="currentFunction" defaultValue={participant.currentFunction} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Endereço</label>
                <input type="text" name="address" defaultValue={participant.address} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">CEP</label>
                <input type="text" name="zipCode" value={zipInput} onChange={handleZipChange} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Cidade</label>
                <input type="text" name="city" defaultValue={participant.city} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Estado (UF)</label>
                <input type="text" name="state" defaultValue={participant.state} maxLength={2} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none uppercase" />
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">País</label>
                <input type="text" name="country" defaultValue={participant.country} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Convidados</label>
                <input type="number" name="guestsCount" defaultValue={participant.guestsCount} min="0" max="20" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
                <p className="mt-1 text-[11px] leading-relaxed text-atlas-text-muted">A contagem administrativa considera estes convidados apenas se a presença estiver confirmada.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Presença</label>
                <select name="willAttend" defaultValue={participant.willAttend} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" required>
                  <option value="yes">Confirmado</option>
                  <option value="maybe">Talvez</option>
                  <option value="no">Não irá</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Valor Pago (R$)</label>
              <input type="number" step="0.01" name="totalPaid" defaultValue={participant.totalPaid} min="0" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none" />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2 rounded border border-atlas-navy-aero/20 bg-atlas-navy-base/50 p-2">
                <input type="checkbox" name="wantsToHelpCommittee" defaultChecked={participant.wantsToHelpCommittee} className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-deep border-atlas-navy-aero/50" />
                <span className="text-white text-xs font-medium uppercase tracking-wider">Voluntário para a Comissão Organizadora</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-atlas-text-light mb-1 uppercase tracking-wider">Observações / Notas</label>
              <textarea name="notes" defaultValue={participant.notes} rows={2} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm focus:border-atlas-gold-main outline-none"></textarea>
            </div>

            {/* Kit Oficial */}
            <div className="border-t border-atlas-navy-aero/30 pt-4">
              <p className="text-xs font-bold text-atlas-gold-main uppercase tracking-widest mb-3">Kit Oficial ATLAS</p>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {["yes","maybe","no"].map(v => (
                  <label key={v} className={`flex items-center justify-center gap-2 px-3 py-2 rounded border cursor-pointer text-xs font-bold uppercase tracking-wider transition-all ${
                    kitInterest === v ? 'bg-atlas-gold-main/10 border-atlas-gold-main/50 text-atlas-gold-main' : 'border-atlas-navy-aero/30 text-atlas-text-muted hover:border-white/20'
                  }`}>
                    <input type="radio" name="adminKitInterest" value={v} checked={kitInterest === v} onChange={() => setKitInterest(v)} className="hidden" />
                    {v === "yes" ? "Sim" : v === "maybe" ? "Talvez" : "Não"}
                  </label>
                ))}
              </div>
              {kitInterest && kitInterest !== "no" && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted mb-1 uppercase tracking-wider">Camiseta</label>
                    <select name="kitShirtSize" defaultValue={participant.officialKit?.shirtSize || ""} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm">
                      <option value="">-</option>
                      {["PP","P","M","G","GG","XG","XGG","SPECIAL"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted mb-1 uppercase tracking-wider">Jaqueta</label>
                    <select name="kitJacketSize" defaultValue={participant.officialKit?.jacketSize || ""} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm">
                      <option value="">-</option>
                      {["PP","P","M","G","GG","XG","XGG","SPECIAL"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-atlas-text-muted mb-1 uppercase tracking-wider">Calça</label>
                    <select name="kitPantsSize" defaultValue={participant.officialKit?.pantsSize || ""} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-3 py-2 text-white text-sm">
                      <option value="">-</option>
                      {["PP","P","M","G","GG","XG","XGG","SPECIAL"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm text-atlas-text-muted hover:text-white transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-atlas-gold-main text-atlas-navy-deep font-bold rounded hover:bg-atlas-gold-dark transition-colors text-sm uppercase tracking-wider disabled:opacity-70 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
