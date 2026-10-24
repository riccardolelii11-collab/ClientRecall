import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Smartphone,
  PhoneCall,
  CheckCircle2,
  Users,
  Compass,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { ProfessionType, UserProfile, RecallChannel } from '../../types';
import { DEFAULT_PROFESSION_CONFIG } from '../../services/recallEngine';

interface ProfessionOnboardingModalProps {
  isOpen: boolean;
  userEmail?: string;
  userName?: string;
  onComplete: (profileUpdates: Partial<UserProfile>, seedSampleData: boolean) => Promise<void>;
}

export const ProfessionOnboardingModal: React.FC<ProfessionOnboardingModalProps> = ({
  isOpen,
  userEmail,
  userName,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const [selectedProfession, setSelectedProfession] = useState<ProfessionType>('barbiere');
  const [customProfessionTitle, setCustomProfessionTitle] = useState('');
  const [businessName, setBusinessName] = useState(
    userName ? `Studio ${userName.split(' ')[0]}` : 'La Mia Attività'
  );
  const [phone, setPhone] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<RecallChannel>('whatsapp');
  const [defaultRecallDays, setDefaultRecallDays] = useState(21);
  const [seedSampleData, setSeedSampleData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectProfession = (prof: ProfessionType) => {
    setSelectedProfession(prof);
    const config = DEFAULT_PROFESSION_CONFIG[prof];
    if (config) {
      setDefaultRecallDays(config.defaultIntervalDays);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onComplete(
        {
          profession: selectedProfession,
          customProfessionTitle: selectedProfession === 'altro' ? customProfessionTitle : undefined,
          businessName: businessName.trim() || undefined,
          phone: phone.trim() || undefined,
          defaultChannel: preferredChannel,
          defaultRecallDays,
          hasCompletedOnboarding: true,
        },
        seedSampleData
      );
    } catch (err) {
      console.error('Errore durante il salvataggio onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProfConfig = DEFAULT_PROFESSION_CONFIG[selectedProfession] || DEFAULT_PROFESSION_CONFIG.barbiere;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header with Progress Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-[#0D5C63] to-teal-800 text-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                  Configura la tua Attività
                </h2>
                <p className="text-xs text-teal-100/90 mt-0.5">
                  Personalizza ClientRecall su misura del tuo lavoro
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-teal-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                Passo {currentStep} di {totalSteps}
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2DD4BF] h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* STEP 1: Profession Selection */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-700" />
                  <span>Cosa fai? Scegli la tua professione o settore</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Questo serve per calibrare i servizi tipici, l'intervallo ideale di ricontatto e i modelli di messaggio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {(Object.keys(DEFAULT_PROFESSION_CONFIG) as ProfessionType[]).map((profKey) => {
                  const conf = DEFAULT_PROFESSION_CONFIG[profKey];
                  const isSelected = selectedProfession === profKey;

                  return (
                    <div
                      key={profKey}
                      onClick={() => handleSelectProfession(profKey)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl shrink-0" role="img" aria-label={conf.label}>
                            {conf.emoji}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {conf.label}
                            </h4>
                            <span className="text-[11px] text-teal-800 font-semibold block mt-0.5">
                              Ciclo abituale: ~{conf.defaultIntervalDays} giorni
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {conf.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {selectedProfession === 'altro' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Specifica la tua professione o attività:
                  </label>
                  <input
                    type="text"
                    required
                    value={customProfessionTitle}
                    onChange={(e) => setCustomProfessionTitle(e.target.value)}
                    placeholder="es. Tatuatore, Toelettatore per Animali, Meccanico, Podologo..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Studio & Channels */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-700" />
                  <span>Il tuo Studio & Canale preferito</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Inserisci l'insegna del tuo studio e il canale che preferisci usare con i tuoi clienti.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-700" />
                  <span>Nome Attività / Studio *</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="es. Barberia Moderna, Studio Benessere, Clinica Dentale..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>Telefono / WhatsApp dello studio (opzionale)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="es. +39 340 1234567"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Verrà utilizzato nella firma dei messaggi o per contatti rapidi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Canale principale di ricontatto preferito
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4 text-emerald-600" />, badge: 'Consigliato' },
                    { id: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4 text-blue-600" /> },
                    { id: 'call', label: 'Telefonata', icon: <PhoneCall className="w-4 h-4 text-amber-600" /> },
                    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-teal-600" /> },
                  ].map((ch) => {
                    const isSelected = preferredChannel === ch.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setPreferredChannel(ch.id as RecallChannel)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-teal-700 bg-teal-50 font-bold text-teal-950 ring-2 ring-teal-700/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex justify-center mb-1.5">{ch.icon}</div>
                        <span className="text-xs block">{ch.label}</span>
                        {ch.badge && (
                          <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full inline-block mt-1">
                            {ch.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Recall Interval Calibration */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>Intervallo abituale di ricontatto</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Dopo quanti giorni dall'ultimo appuntamento un cliente dovrebbe essere ricontattato?
                </p>
              </div>

              <div className="p-5 bg-teal-50/60 border border-teal-900/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-teal-900 block">
                      Intervallo stimato per {currentProfConfig.label}:
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-teal-950 font-mono">
                      {defaultRecallDays} giorni
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultRecallDays((prev) => Math.max(7, prev - 7))}
                      className="px-3 py-1.5 bg-white border border-teal-200 rounded-xl text-xs font-bold text-teal-900 hover:bg-teal-100/50 cursor-pointer"
                    >
                      -7 gg
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultRecallDays((prev) => prev + 7)}
                      className="px-3 py-1.5 bg-white border border-teal-200 rounded-xl text-xs font-bold text-teal-900 hover:bg-teal-100/50 cursor-pointer"
                    >
                      +7 gg
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min="7"
                    max="180"
                    step="1"
                    value={defaultRecallDays}
                    onChange={(e) => setDefaultRecallDays(parseInt(e.target.value) || 28)}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>7 giorni (1 sett.)</span>
                    <span>30 giorni (1 mese)</span>
                    <span>90 giorni (3 mesi)</span>
                    <span>180 giorni (6 mesi)</span>
                  </div>
                </div>

                <div className="text-[11px] text-teal-900/80 leading-relaxed bg-white/70 p-3 rounded-xl border border-teal-100">
                  💡 <strong>Come funziona l'algoritmo intelligente:</strong> ClientRecall calcola la frequenza reale di ogni cliente se ha almeno 2 appuntamenti svolti. Questo intervallo di <strong>{defaultRecallDays} giorni</strong> serve per i nuovi clienti o per chi ha pochi dati storici.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Start Mode & Demo Data */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-700" />
                  <span>Come vuoi iniziare?</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Scegli se caricare alcuni clienti di prova per testare subito il software o partire da zero.
                </p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setSeedSampleData(true)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    seedSampleData
                      ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        🌟
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Carica 5 clienti di prova calibrati sulla tua attività
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                          Consigliato per esplorare subito tutte le funzioni
                        </span>
                      </div>
                    </div>
                    {seedSampleData && (
                      <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Include clienti da ricontattare, clienti regolari e un cliente con appuntamento futuro. Potrai eliminare o modificare questi clienti in qualsiasi momento.
                  </p>
                </div>

                <div
                  onClick={() => setSeedSampleData(false)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    !seedSampleData
                      ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        📋
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Inizia da zero con rubrica vuota
                        </h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Aggiungerai manualmente i tuoi clienti reali
                        </span>
                      </div>
                    </div>
                    {!seedSampleData && (
                      <div className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1.5">
                <p className="font-bold text-slate-900">Riepilogo configurazione:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Attività: <strong>{businessName}</strong></div>
                  <div>Settore: <strong>{currentProfConfig.label}</strong></div>
                  <div>Canale preferito: <strong className="uppercase">{preferredChannel}</strong></div>
                  <div>Ciclo stimato: <strong>{defaultRecallDays} giorni</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Indietro</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Avanti</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm shadow-teal-900/15 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Configurazione in corso...</span>
                ) : (
                  <>
                    <span>Entra nella Dashboard</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-200" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
