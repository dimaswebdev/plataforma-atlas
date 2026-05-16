"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Save } from "lucide-react";
import { Participant } from "@/types/participant";
import { AppButton, AppField, AppInput, AppModal, AppSelect, AppTextarea } from "@/components/ui";
import { capitalizeName, formatPhone, formatZipCode } from "@/lib/utils";
import { fetchWithAdminAuth } from "@/lib/client-auth";

interface ParticipantEditFormProps {
  participant: Participant;
  onClose: () => void;
  onSuccess: () => void;
}

const presenceOptions = [
  { value: "yes", label: "Confirmado" },
  { value: "maybe", label: "Talvez" },
  { value: "no", label: "Não irá" },
];

const kitInterestOptions = [
  { value: "yes", label: "Sim" },
  { value: "maybe", label: "Talvez" },
  { value: "no", label: "Não" },
];

const kitSizeOptions = [
  { value: "", label: "-" },
  { value: "PP", label: "PP" },
  { value: "P", label: "P" },
  { value: "M", label: "M" },
  { value: "G", label: "G" },
  { value: "GG", label: "GG" },
  { value: "XG", label: "XG" },
  { value: "XGG", label: "XGG" },
  { value: "SPECIAL", label: "Especial" },
];

export function ParticipantEditForm({ participant, onClose, onSuccess }: ParticipantEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kitInterest, setKitInterest] = useState<string>(participant.officialKit?.interest || "");

  const [phoneInput, setPhoneInput] = useState(participant.phone || "");
  const [zipInput, setZipInput] = useState(participant.zipCode || "");

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 11) {
      setPhoneInput(formatPhone(val));
    } else {
      setPhoneInput(e.target.value);
    }
  };

  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 8) {
      setZipInput(formatZipCode(val));
    } else {
      setZipInput(e.target.value);
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

  return (
    <AppModal
      open
      onClose={onClose}
      title="Editar participante"
      description="Atualize os dados administrativos do participante mantendo o cadastro consolidado."
      size="xl"
      closeOnEscape={!loading}
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-error-200 bg-error-50 p-3 text-center text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500" aria-live="polite">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Identificação</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Dados principais usados na ficha administrativa.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppField label="Nome">
              <AppInput type="text" name="name" defaultValue={participant.name} required />
            </AppField>
            <AppField label="Nome de guerra">
              <AppInput type="text" name="nickname" defaultValue={participant.nickname} />
            </AppField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppField label="Data de nascimento">
              <AppInput type="date" name="birthDate" defaultValue={participant.birthDate} />
            </AppField>
            <AppField label="Profissão atual / patente">
              <AppInput type="text" name="currentFunction" defaultValue={participant.currentFunction} />
            </AppField>
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-5 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Contato</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Canais privados visíveis à administração.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppField label="Telefone">
              <AppInput type="text" name="phone" value={phoneInput} onChange={handlePhoneChange} required />
            </AppField>
            <AppField label="E-mail">
              <AppInput type="email" name="email" defaultValue={participant.email} />
            </AppField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppField label="Instagram">
              <AppInput type="text" name="instagram" defaultValue={participant.instagram} />
            </AppField>
            <AppField label="LinkedIn">
              <AppInput type="text" name="linkedin" defaultValue={participant.linkedin} />
            </AppField>
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-5 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Endereço</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Localização atual e dados complementares.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AppField label="Endereço" className="sm:col-span-2">
              <AppInput type="text" name="address" defaultValue={participant.address} />
            </AppField>
            <AppField label="CEP">
              <AppInput type="text" name="zipCode" value={zipInput} onChange={handleZipChange} />
            </AppField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AppField label="Cidade">
              <AppInput type="text" name="city" defaultValue={participant.city} required />
            </AppField>
            <AppField label="Estado (UF)">
              <AppInput type="text" name="state" defaultValue={participant.state} maxLength={2} className="uppercase" />
            </AppField>
            <AppField label="País">
              <AppInput type="text" name="country" defaultValue={participant.country} />
            </AppField>
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-5 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Participação</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Presença, convidados, comissão e controle financeiro inicial.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AppField label="Presença">
              <AppSelect name="willAttend" options={presenceOptions} defaultValue={participant.willAttend} required />
            </AppField>
            <AppField label="Convidados">
              <AppInput type="number" name="guestsCount" defaultValue={participant.guestsCount} min="0" max="20" />
            </AppField>
            <AppField label="Valor pago (R$)">
              <AppInput type="number" step="0.01" name="totalPaid" defaultValue={participant.totalPaid} min="0" />
            </AppField>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <input
              type="checkbox"
              name="wantsToHelpCommittee"
              defaultChecked={participant.wantsToHelpCommittee}
              className="mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Voluntário para a Comissão Organizadora
            </span>
          </label>

          <AppField label="Observações / notas">
            <AppTextarea name="notes" defaultValue={participant.notes} rows={3} />
          </AppField>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-5 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Kit oficial ATLAS</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Interesse, medidas e personalização inicial.</p>
          </div>

          <AppField label="Interesse no kit">
            <AppSelect
              name="adminKitInterest"
              options={kitInterestOptions}
              value={kitInterest}
              onChange={(event) => setKitInterest(event.target.value)}
              placeholder="Selecione"
            />
          </AppField>

          {kitInterest && kitInterest !== "no" ? (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <AppField label="Camiseta">
                  <AppSelect name="kitShirtSize" options={kitSizeOptions} defaultValue={participant.officialKit?.shirtSize || ""} />
                </AppField>
                <AppField label="Jaqueta">
                  <AppSelect name="kitJacketSize" options={kitSizeOptions} defaultValue={participant.officialKit?.jacketSize || ""} />
                </AppField>
                <AppField label="Calça">
                  <AppSelect name="kitPantsSize" options={kitSizeOptions} defaultValue={participant.officialKit?.pantsSize || ""} />
                </AppField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AppField label="Altura (cm)">
                  <AppInput type="number" name="kitHeightCm" defaultValue={participant.officialKit?.heightCm} min="0" />
                </AppField>
                <AppField label="Peso aprox. (kg)">
                  <AppInput type="number" name="kitWeightKg" defaultValue={participant.officialKit?.approximateWeightKg} min="0" />
                </AppField>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                  <input
                    type="checkbox"
                    name="kitNeedsSpecialSize"
                    defaultChecked={participant.officialKit?.needsSpecialSize}
                    className="mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Precisa de tamanho especial</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                  <input
                    type="checkbox"
                    name="kitWantsCustomization"
                    defaultChecked={participant.officialKit?.wantsNameCustomization}
                    className="mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deseja personalização de nome</span>
                </label>
              </div>

              <AppField label="Nome para personalização">
                <AppInput type="text" name="kitCustomizationName" defaultValue={participant.officialKit?.customizationName} />
              </AppField>

              <AppField label="Observações do kit">
                <AppTextarea name="kitNotes" defaultValue={participant.officialKit?.notes} rows={3} />
              </AppField>
            </div>
          ) : null}
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </AppButton>
          <AppButton
            type="submit"
            loading={loading}
            startIcon={!loading ? <Save className="h-4 w-4" /> : undefined}
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
