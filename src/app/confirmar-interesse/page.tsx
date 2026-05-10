"use client";

import { useState, useRef } from "react";
import { createParticipant } from "@/data/participants";
import { Participant } from "@/types/participant";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { capitalizeName, formatPhone, formatZipCode } from "@/lib/utils";
import { PageHeader } from "@/components/public/PageHeader";
import { 
  ADHESION_TERM_VERSION, 
  PRIVACY_POLICY_VERSION, 
  PLATFORM_TERMS_VERSION, 
  FINANCIAL_TERMS_VERSION, 
  IMAGE_USE_TERM_VERSION, 
  SOUVENIRS_TERM_VERSION 
} from "@/lib/legal-constants";
import Link from "next/link";

export default function ConfirmarInteressePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [pendingPayload, setPendingPayload] = useState<Omit<Participant, 'id'|'createdAt'|'updatedAt'> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-formatters and conditionals
  const [phoneInput, setPhoneInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("MS");

  const isFromCampoGrande = cityInput.toLowerCase().includes("campo") && cityInput.toLowerCase().includes("grande") && stateInput === "MS";
  const progressPercentage = (completedSteps.length / 3) * 100;

  // Kit State
  const [kitInterest, setKitInterest] = useState<"yes" | "maybe" | "no" | "">("");
  const [wantsNameCustomization, setWantsNameCustomization] = useState(false);

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

  const nextStep = () => {
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentStep < 3) {
      nextStep();
      return;
    }

    // Build payload from form
    const formData = new FormData(e.currentTarget);
    const willAttend = formData.get("willAttend") as "yes" | "maybe" | "no";
    const rawName = formData.get("name") as string;
    const rawNickname = formData.get("nickname") as string;
    const rawCity = formData.get("city") as string;
    const rawFunction = formData.get("currentFunction") as string;

    const officialKit = kitInterest ? {
      interest: kitInterest as "yes" | "maybe" | "no",
      shirtSize: (formData.get("shirtSize") as any) || undefined,
      jacketSize: (formData.get("jacketSize") as any) || undefined,
      pantsSize: (formData.get("pantsSize") as any) || undefined,
      heightCm: formData.get("heightCm") ? Number(formData.get("heightCm")) : undefined,
      approximateWeightKg: formData.get("approximateWeightKg") ? Number(formData.get("approximateWeightKg")) : undefined,
      needsSpecialSize: formData.get("needsSpecialSize") === "on",
      wantsNameCustomization: formData.get("wantsNameCustomization") === "on",
      customizationName: (formData.get("customizationName") as string) || undefined,
      additionalKitsInterest: (formData.get("additionalKitsInterest") as "yes" | "maybe" | "no") || undefined,
      notes: (formData.get("kitNotes") as string) || undefined,
    } : undefined;

    const payload = {
      name: capitalizeName(rawName),
      nickname: rawNickname ? capitalizeName(rawNickname) : "",
      email: ((formData.get("email") as string) || "").toLowerCase(),
      phone: formatPhone(formData.get("phone") as string),
      instagram: (formData.get("instagram") as string) || "",
      linkedin: (formData.get("linkedin") as string) || "",
      birthDate: formData.get("birthDate") as string,
      currentFunction: rawFunction ? capitalizeName(rawFunction) : "",
      zipCode: formatZipCode(formData.get("zipCode") as string),
      address: (formData.get("address") as string) || "",
      city: rawCity ? capitalizeName(rawCity) : "",
      state: ((formData.get("state") as string) || "").toUpperCase(),
      country: ((formData.get("country") as string) || "").toUpperCase(),
      willAttend,
      isFromOutOfState: formData.get("state") !== "MS",
      guestsCount: Number(formData.get("guestsCount") || 0),
      needsHotelInfo: formData.get("needsHotelInfo") === "on",
      needsTransportInfo: formData.get("needsTransportInfo") === "on",
      wantsToHelpCommittee: formData.get("wantsToHelpCommittee") === "on",
      notes: (formData.get("notes") as string) || "",
      paymentStatus: "not_started" as const,
      totalPaid: 0,
      officialKit,
      termsAcceptance: {
        adhesionTermAccepted: formData.get("adhesionTerm") === "on",
        privacyPolicyAccepted: formData.get("privacyPolicy") === "on",
        platformTermsAccepted: formData.get("platformTerms") === "on",
        financialTermsAccepted: formData.get("financialTerms") === "on",
        imageUseAuthorized: formData.get("imageUse") === "on",
        souvenirsInfoAccepted: formData.get("souvenirsInfo") === "on",
        acceptedAt: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
        adhesionTermVersion: ADHESION_TERM_VERSION,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        platformTermsVersion: PLATFORM_TERMS_VERSION,
        financialTermsVersion: FINANCIAL_TERMS_VERSION,
        imageUseTermVersion: IMAGE_USE_TERM_VERSION,
        souvenirsTermVersion: SOUVENIRS_TERM_VERSION
      }
    };

    setPendingPayload(payload);
    setShowConfirmModal(true);
  }

  async function handleConfirmedSubmit() {
    if (!pendingPayload) return;
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const res = await fetch("/api/data?collection=participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingPayload)
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      setCompletedSteps(prev => prev.includes(3) ? prev : [...prev, 3]);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Erro ao salvar participante:", error);
      alert("Erro ao salvar cadastro. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-atlas-navy-base">
      <PublicNav />
      <PageHeader
        bgImage="/images/hero-bg.png"
        accent="Portal ATLAS"
        title="Cadastro e Presença"
        subtitle="Preencha seus dados para realizar seu cadastro oficial e confirmar sua presença no evento de 30 anos da Turma ATLAS."
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
            <>
              {/* Top progress line */}
              <div className="absolute top-0 left-0 h-1 bg-atlas-gold-main/20 w-full">
                <div 
                  className="h-full bg-atlas-gold-main transition-all duration-700 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              {/* Stepper Progress */}
              <div className="flex justify-between items-center mb-8 relative z-10">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`flex items-center ${step !== 3 ? 'flex-1' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 shrink-0 ${
                      completedSteps.includes(step)
                        ? 'bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                        : currentStep === step
                        ? 'bg-atlas-gold-main text-atlas-navy-deep shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                        : 'bg-atlas-navy-base border border-atlas-navy-aero/50 text-atlas-text-muted'
                    }`}>
                      {completedSteps.includes(step) ? <CheckCircle className="w-4 h-4" /> : step}
                    </div>
                    {step !== 3 && (
                      <div className={`flex-1 h-0.5 mx-3 transition-all duration-500 ${
                        completedSteps.includes(step) ? 'bg-green-500' : currentStep > step ? 'bg-atlas-gold-main' : 'bg-atlas-navy-aero/30'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mb-8 relative z-10">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">
                  {currentStep === 1 && "Passo 1: Identificação"}
                  {currentStep === 2 && "Passo 2: Evento & Presença"}
                  {currentStep === 3 && "Passo 3: Kit Oficial ATLAS"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                
                {/* STEP 1 */}
                <div className={currentStep === 1 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
                  
                  <div className="bg-atlas-navy-base/50 p-6 rounded border border-atlas-navy-aero/20 mb-6">
                    <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-4 border-b border-atlas-navy-aero/30 pb-2">Dados Pessoais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-atlas-text-light mb-1">Nome Completo *</label>
                        <input required={currentStep===1} name="name" type="text" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-atlas-text-light mb-1">Nome de Guerra / Apelido</label>
                        <input name="nickname" type="text" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-atlas-text-light mb-1">Data de Nascimento *</label>
                        <input required={currentStep===1} name="birthDate" type="date" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-atlas-text-light mb-1">Profissão Atual</label>
                        <input name="currentFunction" type="text" placeholder="Ex: Engenheiro, Advogado, etc." className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-atlas-text-light mb-1">Telefone (WhatsApp) *</label>
                        <input required={currentStep===1} name="phone" type="tel" value={phoneInput} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" />
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
                        <input 
                          required={currentStep===1} 
                          name="city" 
                          type="text" 
                          value={cityInput} 
                          onChange={(e) => setCityInput(e.target.value)} 
                          className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-atlas-text-light mb-1">Estado</label>
                        <select 
                          name="state" 
                          value={stateInput} 
                          onChange={(e) => setStateInput(e.target.value)} 
                          className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main"
                        >
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
                </div>

                {/* STEP 2 */}
                <div className={currentStep === 2 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
                  <div className="bg-atlas-navy-base/50 p-6 rounded border border-atlas-navy-aero/20">
                    <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-4 border-b border-atlas-navy-aero/30 pb-2">Sobre o Evento</h3>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-atlas-text-light mb-3">Você pretende participar do reencontro? *</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="willAttend" value="yes" required={currentStep===2} className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                          <span className="text-white">Sim, com certeza</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="willAttend" value="maybe" required={currentStep===2} className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                          <span className="text-white">Ainda não tenho certeza</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="willAttend" value="no" required={currentStep===2} className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
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
                </div>

                {/* STEP 3 - KIT OFICIAL */}
                <div className={currentStep === 3 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
                  <div className="bg-gradient-to-b from-atlas-navy-base/80 to-atlas-navy-deep p-6 rounded border border-atlas-gold-main/30 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                    <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-2 border-b border-atlas-navy-aero/30 pb-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Kit Oficial ATLAS 30 Anos
                    </h3>
                    <p className="text-sm text-atlas-text-light mb-6">A comissão está avaliando fornecer um souvenir premium composto por jaqueta, camiseta e calça, inspirado em uniformes esportivos de delegações. Gostaríamos de mapear o interesse geral.</p>

                    <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                      <label className="block text-sm font-medium text-white mb-3">Você tem interesse em adquirir o Kit Oficial ATLAS 30 Anos? *</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="kitInterest" value="yes" required={currentStep===3} onChange={() => setKitInterest("yes")} checked={kitInterest === "yes"} className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                          <span className="text-white font-medium">Sim, com certeza</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="kitInterest" value="maybe" required={currentStep===3} onChange={() => setKitInterest("maybe")} checked={kitInterest === "maybe"} className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                          <span className="text-white font-medium">Talvez</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="kitInterest" value="no" required={currentStep===3} onChange={() => setKitInterest("no")} checked={kitInterest === "no"} className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                          <span className="text-white font-medium">Não tenho interesse</span>
                        </label>
                      </div>
                    </div>

                    {(kitInterest === "yes" || kitInterest === "maybe") && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-atlas-gold-main uppercase tracking-wider mb-1">Camiseta *</label>
                            <select required name="shirtSize" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:border-atlas-gold-main">
                              <option value="">Selecione...</option>
                              {["PP","P","M","G","GG","XG","XGG","SPECIAL"].map(s => <option key={s} value={s}>{s === "SPECIAL" ? "Tamanho Especial" : s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-atlas-gold-main uppercase tracking-wider mb-1">Jaqueta *</label>
                            <select required name="jacketSize" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:border-atlas-gold-main">
                              <option value="">Selecione...</option>
                              {["PP","P","M","G","GG","XG","XGG","SPECIAL"].map(s => <option key={s} value={s}>{s === "SPECIAL" ? "Tamanho Especial" : s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-atlas-gold-main uppercase tracking-wider mb-1">Calça *</label>
                            <select required name="pantsSize" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:border-atlas-gold-main">
                              <option value="">Selecione...</option>
                              {["PP","P","M","G","GG","XG","XGG","SPECIAL"].map(s => <option key={s} value={s}>{s === "SPECIAL" ? "Tamanho Especial" : s}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-atlas-text-light mb-1">Altura (cm)</label>
                            <input name="heightCm" type="number" placeholder="Ex: 180" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-atlas-text-light mb-1">Peso Aproximado (kg)</label>
                            <input name="approximateWeightKg" type="number" placeholder="Ex: 85" className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white" />
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" name="needsSpecialSize" className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                            <span className="text-white text-sm">Preciso de tamanho especial / sob medida</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" name="wantsNameCustomization" checked={wantsNameCustomization} onChange={(e) => setWantsNameCustomization(e.target.checked)} className="rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50" />
                            <span className="text-white text-sm">Desejo personalizar as peças com meu nome</span>
                          </label>
                        </div>

                        {wantsNameCustomization && (
                          <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-atlas-gold-main uppercase tracking-wider mb-1">Nome para Personalização *</label>
                            <input required={wantsNameCustomization} name="customizationName" type="text" maxLength={15} placeholder="Máx 15 caracteres" className="w-full bg-atlas-gold-main/5 border border-atlas-gold-main/30 rounded px-4 py-2 text-white font-mono uppercase tracking-widest" />
                          </div>
                        )}

                        <div className="pt-4 border-t border-white/5">
                          <label className="block text-sm font-medium text-atlas-text-light mb-3">Deseja comprar kit adicional para acompanhante/familiar?</label>
                          <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="additionalKitsInterest" value="yes" className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                              <span className="text-white text-sm">Sim</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="additionalKitsInterest" value="maybe" className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                              <span className="text-white text-sm">Talvez</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input type="radio" name="additionalKitsInterest" value="no" defaultChecked className="text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base" />
                              <span className="text-white text-sm">Não</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-atlas-text-light mb-1">Observações sobre medidas ou kits adicionais</label>
                            <textarea name="kitNotes" rows={2} className="w-full bg-atlas-navy-base border border-atlas-navy-aero/50 rounded px-4 py-2 text-white focus:outline-none focus:border-atlas-gold-main"></textarea>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* TERMOS E AUTORIZAÇÕES */}
                  <div className="mt-12 p-6 bg-atlas-navy-base/50 rounded border border-atlas-navy-aero/20">
                    <h3 className="text-lg font-bold text-atlas-gold-main uppercase tracking-wider mb-4 border-b border-atlas-navy-aero/30 pb-2">Termos e Autorizações</h3>
                    <p className="text-xs text-atlas-text-muted mb-6 italic">Para concluir seu cadastro oficial, é necessário ler e aceitar os documentos abaixo.</p>
                    
                    <div className="space-y-4">
                      {[
                        { name: "adhesionTerm", label: "Li e aceito o Termo de Adesão ao Reencontro 30 Anos — Turma ATLAS.", required: true, href: "/termos/adesao" },
                        { name: "privacyPolicy", label: "Li e aceito a Política de Privacidade do Portal ATLAS.", required: true, href: "/politica-privacidade" },
                        { name: "platformTerms", label: "Li e aceito os Termos de Uso da Plataforma.", required: true, href: "/termos/uso" },
                        { name: "financialTerms", label: "Estou ciente das regras de pagamento, desistência, reembolso e prestação de contas.", required: true, href: "/termos/transparencia-financeira" },
                        { name: "imageUse", label: "Autorizo o uso da minha imagem em registros oficiais do evento, galeria, vídeo comemorativo e materiais da Turma ATLAS.", required: false, href: "/termos/uso-imagem" },
                        { name: "souvenirsInfo", label: "Aceito receber informações sobre souvenirs, produtos personalizados e Kit Oficial ATLAS 30 Anos.", required: false, href: "/termos/souvenirs" }
                      ].map((term) => (
                        <div key={term.name} className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            name={term.name}
                            id={term.name}
                            required={term.required}
                            className="mt-1 w-5 h-5 rounded text-atlas-gold-main focus:ring-atlas-gold-main bg-atlas-navy-base border-atlas-navy-aero/50"
                          />
                          <label htmlFor={term.name} className="text-white text-sm leading-tight cursor-pointer">
                            {term.label} {term.required && <span className="text-red-500">*</span>}
                            <Link href={term.href} target="_blank" className="ml-1 text-atlas-gold-main hover:underline opacity-80 text-[10px] uppercase font-bold tracking-tighter">Ler Termo</Link>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-6 mt-6 border-t border-atlas-navy-aero/30">
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="px-6 py-4 bg-atlas-navy-base text-white border border-atlas-navy-aero/50 rounded hover:bg-atlas-navy-aero/20 transition-colors uppercase tracking-widest font-bold flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" /> Voltar
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button 
                      type="submit" 
                      className="flex-1 py-4 bg-atlas-gold-main text-atlas-navy-deep font-bold rounded hover:bg-atlas-gold-dark transition-colors uppercase tracking-widest flex justify-center items-center gap-2 text-lg"
                    >
                      Próximo <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 py-4 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition-colors uppercase tracking-widest disabled:opacity-70 flex justify-center items-center text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      {loading ? "Enviando..." : "Salvar no Compêndio Oficial"}
                    </button>
                  )}
                </div>

              </form>
            </>
          )}
        </div>
      </main>
      <PublicFooter />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#060e1c]/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-atlas-navy-deep w-full max-w-md rounded-2xl border border-atlas-gold-main/30 shadow-[0_0_60px_rgba(212,175,55,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#030712] via-[#0a192f] to-[#030712] px-8 py-6 border-b border-atlas-gold-main/20 flex items-center gap-4">
              <div className="p-3 bg-atlas-gold-main/10 rounded-xl border border-atlas-gold-main/20">
                <AlertTriangle className="w-6 h-6 text-atlas-gold-main" />
              </div>
              <div>
                <h3 className="text-white font-black tracking-widest uppercase text-base">Confirmar Cadastro</h3>
                <p className="text-atlas-gold-main/70 text-xs tracking-wider font-bold mt-0.5">Turma ATLAS 30 Anos</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-8">
              <p className="text-white text-base font-medium mb-2">Deseja salvar os dados de <span className="text-atlas-gold-main font-bold">"{pendingPayload?.name}"</span> no Compêndio Oficial?</p>
              <p className="text-atlas-text-muted text-sm leading-relaxed">
                Confirme se todas as informações (incluindo tamanhos do Kit Oficial) estão corretas antes de finalizar.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-8 pb-8 flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-atlas-text-light hover:text-white border border-white/10 rounded-xl font-bold uppercase tracking-widest transition-all text-sm"
              >
                Revisar
              </button>
              <button
                onClick={handleConfirmedSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-atlas-gold-main hover:bg-atlas-gold-dark text-atlas-navy-deep font-black uppercase tracking-widest rounded-xl transition-all text-sm disabled:opacity-70 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
              >
                {loading ? "Salvando..." : <><CheckCircle className="w-4 h-4" /> Confirmar e Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
