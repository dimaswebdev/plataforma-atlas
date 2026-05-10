"use client";

import { useState } from "react";
import { createParticipant } from "@/data/participants";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck } from "lucide-react";
import { capitalizeName, formatPhone, formatZipCode } from "@/lib/utils";
import { PageHeader } from "@/components/public/PageHeader";

export default function ConfirmarInteressePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-formatters and conditionals
  const [phoneInput, setPhoneInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("MS");

  const isFromCampoGrande = cityInput.toLowerCase().includes("campo") && cityInput.toLowerCase().includes("grande") && stateInput === "MS";

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

    const formData = new FormData(e.currentTarget);
    const willAttend = formData.get("willAttend") as "yes" | "maybe" | "no";
    
    // SANITIZATION
    const rawName = formData.get("name") as string;
    const rawNickname = formData.get("nickname") as string;
    const rawCity = formData.get("city") as string;
    const rawFunction = formData.get("currentFunction") as string;
    
    try {
      await createParticipant({
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
        willAttend,
        isFromOutOfState: formData.get("state") !== "MS",
        guestsCount: Number(formData.get("guestsCount") || 0),
        needsHotelInfo: formData.get("needsHotelInfo") === "on",
        needsTransportInfo: formData.get("needsTransportInfo") === "on",
        wantsToHelpCommittee: formData.get("wantsToHelpCommittee") === "on",
        notes: formData.get("notes") as string,
        paymentStatus: "not_started",
        totalPaid: 0,
      });
      setSuccess(true);
    } catch (error) {
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/hero-bg.png"
        accent="Compêndio da Turma"
        title="Compêndio e Presença"
        subtitle="Preencha seus dados para atualizar o Compêndio Oficial da Turma ATLAS e ajudar a comissão a dimensionar o evento de 30 anos."
      />
      <main className="flex-grow py-12 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-atlas-navy-deep p-8 rounded-lg border border-atlas-navy-aero/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-gold-main/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          {success ? (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Confirmação Recebida!</h2>
              <p className="text-atlas-text-muted mb-6">
                Seus dados foram salvos no Compêndio da Turma com sucesso. A comissão organizadora entrará em contato em breve.
              </p>
              <button 
                onClick={() => window.location.href = "/"}
                className="px-6 py-2 bg-atlas-gold-main text-atlas-navy-deep rounded font-semibold hover:bg-atlas-gold-dark uppercase tracking-wider transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              
              <div className="bg-atlas-navy-base/50 p-6 rounded border border-atlas-navy-aero/20">
                <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-4 border-b border-atlas-navy-aero/30 pb-2">Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Nome Completo *</label>
                    <input required name="name" type="text" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Nome de Guerra / Apelido</label>
                    <input name="nickname" type="text" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Data de Nascimento *</label>
                    <input required name="birthDate" type="date" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Profissão Atual</label>
                    <input name="currentFunction" type="text" placeholder="Ex: Engenheiro, Advogado, etc." className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Telefone (WhatsApp) *</label>
                    <input required name="phone" type="tel" value={phoneInput} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">E-mail</label>
                    <input name="email" type="email" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Instagram (Opcional)</label>
                    <input name="instagram" type="text" placeholder="@seuusuario" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">LinkedIn (Opcional)</label>
                    <input name="linkedin" type="text" placeholder="URL ou Nome" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>
              </div>

              <div className="bg-atlas-navy-base/50 p-6 rounded border border-atlas-navy-aero/20">
                <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-4 border-b border-atlas-navy-aero/30 pb-2">Localização</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Endereço Completo</label>
                    <input name="address" type="text" placeholder="Rua, Número, Bairro, Complemento" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">CEP / Zip Code</label>
                    <input name="zipCode" type="text" value={zipInput} onChange={handleZipChange} placeholder="00000-000" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Cidade atual *</label>
                    <input required name="city" type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Estado</label>
                    <select name="state" value={stateInput} onChange={(e) => setStateInput(e.target.value)} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main">
                      <option value="MS">MS</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="DF">DF</option>
                      <option value="PR">PR</option>
                      <option value="OUTRO">Outro / Exterior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">País</label>
                    <input name="country" type="text" defaultValue="Brasil" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>
              </div>

              <div className="bg-atlas-navy-base/50 p-6 rounded border border-atlas-navy-aero/20">
                <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-4 border-b border-atlas-navy-aero/30 pb-2">Sobre o Evento</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-atlas-text-light mb-3">Você pretende participar do reencontro? *</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="willAttend" value="yes" required className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                      <span className="text-white">Sim, com certeza</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="willAttend" value="maybe" required className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                      <span className="text-white">Ainda não tenho certeza</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="willAttend" value="no" required className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                      <span className="text-white">Infelizmente não poderei</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-atlas-text-light mb-1">Previsão de convidados (familiares)</label>
                    <input name="guestsCount" type="number" min="0" defaultValue="0" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-atlas-text-light mb-2">Apoio Logístico (Opcional):</p>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="needsHotelInfo" className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                    <span className="text-white text-sm">Gostaria de receber informações sobre hotéis parceiros</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="needsTransportInfo" className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                    <span className="text-white text-sm">Gostaria de receber dicas sobre transporte/translado</span>
                  </label>
                  {isFromCampoGrande && (
                    <label className="flex items-center space-x-2 mt-2 p-3 bg-atlas-gold-main/10 border border-atlas-gold-main/30 rounded">
                      <input type="checkbox" name="wantsToHelpCommittee" className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                      <span className="text-white text-sm font-bold">Gostaria de ajudar na comissão organizadora em Campo Grande</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-atlas-text-light mb-1">Observações adicionais / Mensagem para a turma</label>
                  <textarea name="notes" rows={3} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main"></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-atlas-gold-main text-atlas-navy-deep font-bold rounded hover:bg-atlas-gold-dark transition-colors uppercase tracking-widest disabled:opacity-70 flex justify-center items-center text-lg"
              >
                {loading ? "Enviando Dados..." : "Salvar no Compêndio"}
              </button>
            </form>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
