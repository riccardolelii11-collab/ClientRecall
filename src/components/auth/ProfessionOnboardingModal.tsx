import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Scissors,
  UserCheck,
  Check,
  Building,
  Clock,
  Sparkle,
} from 'lucide-react';
import { ProfessionType, UserProfile } from '../../types';
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
  const [selectedProfession, setSelectedProfession] = useState<ProfessionType>('barbiere');
  const [customProfessionTitle, setCustomProfessionTitle] = useState('');
  const [businessName, setBusinessName] = useState(userName ? `Studio ${userName}` : '');
  const [defaultRecallDays, setDefaultRecallDays] = useState(21);
  const [seedSampleData, setSeedSampleData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectProfession = (prof: ProfessionType) => {
    setSelectedProfession(prof);
    const config = DEFAULT_PROFESSION_CONFIG[prof];
    setDefaultRecallDays(config.defaultIntervalDays);
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
          defaultRecallDays,
          hasCompletedOnboarding: true,
        },
        seedSampleData
      );
    } catch (err) {
      console.error('Errore salvataggio onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-teal-900/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-950 via-[#0D5C63] to-teal-800 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Benvenuto in ClientRecall!
            </h2>
            <p className="text-xs text-teal-100/90 mt-0.5">
              Seleziona la tua professione per calibrare la stima dei ricontatti e i modelli di messaggio.
            </p>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Profession Selection Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Qual è la tua attività principale? *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(DEFAULT_PROFESSION_CONFIG) as ProfessionType[]).map((profKey) => {
                const conf = DEFAULT_PROFESSION_CONFIG[profKey];
                const isSelected = selectedProfession === profKey;

                return (
                  <div
                    key={profKey}
                    onClick={() => handleSelectProfession(profKey)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl" role="img" aria-label={conf.label}>
                          {conf.emoji}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-tight">
                            {conf.label}
                          </h3>
                          <span className="text-[11px] text-teal-800 font-semibold block mt-0.5">
                            Ciclo consigliato: ~{conf.defaultIntervalDays} giorni
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
                <input
                  type="text"
                  required
                  value={customProfessionTitle}
                  onChange={(e) => setCustomProfessionTitle(e.target.value)}
                  placeholder="Specifica la tua professione (es. Tatuatore, Nutrizionista, Massoterapista...)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>
            )}
          </div>

          {/* Business Name and Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-700" />
                <span>Nome Insegna / Studio</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="es. Barberia Moderna, Salone Chic..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>Intervallo iniziale stimato (giorni)</span>
              </label>
              <input
                type="number"
                min="7"
                max="180"
                value={defaultRecallDays}
                onChange={(e) => setDefaultRecallDays(Math.max(7, parseInt(e.target.value) || 28))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Viene utilizzato quando un cliente ha meno di 2 appuntamenti registrati.
              </span>
            </div>
          </div>

          {/* Seed demo option */}
          <div className="p-4 bg-teal-50/70 border border-teal-900/10 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="seedDemo"
              checked={seedSampleData}
              onChange={(e) => setSeedSampleData(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-teal-700 focus:ring-teal-600 border-slate-300"
            />
            <label htmlFor="seedDemo" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-teal-950 block">
                Carica alcuni clienti dimostrativi per provare subito l'algoritmo
              </span>
              <span className="text-teal-800/80 block mt-0.5 leading-relaxed">
                Include clienti da ricontattare, un cliente in regola e un cliente con appuntamento futuro per vedere all'opera i filtri intelligenti. Potrai eliminarli in qualsiasi momento.
              </span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-900/15"
            >
              {isSubmitting ? (
                <span>Configurazione in corso...</span>
              ) : (
                <>
                  <span>Salva e Inizia ad usare ClientRecall</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
