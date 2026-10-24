import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Smartphone,
  Save,
  Bell,
  Clock,
  ArrowRight,
  ShieldCheck,
  Edit3,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Client, GeneratedOption, UserProfile, RecallChannel, RecallReminder } from '../../types';
import { aiService } from '../../services/aiService';

interface GeneratorViewProps {
  clients: Client[];
  selectedClientFromNav: Client | null;
  profile: UserProfile;
  onSaveToHistory: (item: {
    clientId: string;
    clientName: string;
    channel: RecallChannel;
    reason: string;
    messageText: string;
  }) => void;
  onSaveToReminders: (reminder: Omit<RecallReminder, 'id' | 'completed'>) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  clients,
  selectedClientFromNav,
  profile,
  onSaveToHistory,
  onSaveToReminders,
  onShowToast,
}) => {
  // Client selection
  const [selectedClientId, setSelectedClientId] = useState<string>(
    selectedClientFromNav?.id || (clients.length > 0 ? clients[0].id : '')
  );
  const [isCustomClient, setIsCustomClient] = useState<boolean>(false);
  const [customClientName, setCustomClientName] = useState<string>('');
  const [customClientService, setCustomClientService] = useState<string>('');

  // Generation parameters
  const [reason, setReason] = useState<string>('Check-in periodico / Controllo di routine');
  const [channel, setChannel] = useState<RecallChannel>('whatsapp');
  const [tone, setTone] = useState<string>('Caldo e amichevole');
  const [length, setLength] = useState<string>('Medio (equilibrato)');
  const [customContext, setCustomContext] = useState<string>('');

  // Preview mode (Editor vs Channel Simulator)
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('editor');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('1');
  const [editedText, setEditedText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeEngineSource, setActiveEngineSource] = useState<string>('');

  useEffect(() => {
    if (selectedClientFromNav) {
      setSelectedClientId(selectedClientFromNav.id);
      setIsCustomClient(false);
      setChannel(selectedClientFromNav.preferredChannel);
      if (selectedClientFromNav.notes) {
        setCustomContext(selectedClientFromNav.notes);
      }
    }
  }, [selectedClientFromNav]);

  const activeClient = clients.find((c) => c.id === selectedClientId);

  const getEffectiveClientName = () => {
    if (isCustomClient) return customClientName || 'Cliente';
    return activeClient?.name || 'Cliente';
  };

  const getEffectiveService = () => {
    if (isCustomClient) return customClientService || 'il nostro servizio';
    return activeClient?.lastService || 'la nostra ultima sessione';
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsCopied(false);

    try {
      const clientName = getEffectiveClientName();
      const clientService = getEffectiveService();
      const clientNotes = isCustomClient ? '' : activeClient?.notes || '';

      const result = await aiService.generateRecallMessages(
        {
          clientId: isCustomClient ? undefined : activeClient?.id,
          clientName,
          clientService,
          clientNotes,
          reason,
          channel,
          tone,
          length,
          customContext,
        },
        profile
      );

      setGeneratedOptions(result.options);
      setActiveEngineSource(result.source);
      if (result.options.length > 0) {
        setSelectedOptionId(result.options[0].id);
        setEditedText(result.options[0].text);
      }
      onShowToast('3 varianti generate!', 'Puoi scegliere la migliore e ritoccarla a mano.');
    } catch {
      onShowToast('Errore di generazione', 'Riprova tra poco.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (generatedOptions.length === 0) {
      handleGenerate();
    }
  }, []);

  const handleSelectOption = (option: GeneratedOption) => {
    setSelectedOptionId(option.id);
    setEditedText(option.text);
    setIsCopied(false);
  };

  const handleCopy = async () => {
    if (!editedText.trim()) return;
    try {
      await navigator.clipboard.writeText(editedText);
      setIsCopied(true);
      onShowToast('Messaggio copiato!', 'Pronto da incollare su WhatsApp, Email o SMS.');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      onShowToast('Copia manuale', 'Seleziona e copia il testo.', 'info');
    }
  };

  const handleSaveHistory = () => {
    if (!editedText.trim()) return;
    onSaveToHistory({
      clientId: isCustomClient ? 'custom' : activeClient?.id || 'custom',
      clientName: getEffectiveClientName(),
      channel,
      reason,
      messageText: editedText,
    });
    onShowToast('Salvato in Cronologia', 'Potrai segnare la risposta del cliente.');
  };

  const handleCreateReminder = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    onSaveToReminders({
      clientId: isCustomClient ? 'custom' : activeClient?.id || 'custom',
      clientName: getEffectiveClientName(),
      title: `Follow-up recall ${getEffectiveClientName()}`,
      dueDate: dateStr,
      priority: 'medium',
      channel,
      notes: `Verificare se ${getEffectiveClientName()} ha risposto al messaggio inviato.`,
    });
    onShowToast('Promemoria programmato', `Registrato per il ${dateStr}.`);
  };

  const characterCount = editedText.length;
  const wordCount = editedText.trim() ? editedText.trim().split(/\s+/).length : 0;
  const isSMS = channel === 'sms';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Compositore Recall AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personalizza il messaggio in base al rapporto con il cliente e copialo con un clic.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Nessun invio automatico: piena revisione umana</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs space-y-5">
            {/* Target Client */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Cliente Destinatario
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomClient(!isCustomClient)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {isCustomClient ? 'Seleziona da rubrica' : '+ Altro cliente'}
                </button>
              </div>

              {!isCustomClient ? (
                <div className="space-y-2">
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const cli = clients.find((c) => c.id === e.target.value);
                      if (cli) {
                        setChannel(cli.preferredChannel);
                        if (cli.notes) setCustomContext(cli.notes);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.companyOrRole})
                      </option>
                    ))}
                  </select>

                  {activeClient && (
                    <div className="px-3.5 py-2.5 bg-slate-50/70 rounded-xl text-xs text-slate-600 space-y-0.5 border border-slate-100">
                      <p className="font-semibold text-slate-900">{activeClient.name}</p>
                      <p className="text-slate-500 text-[11px]">
                        Servizio: <span className="text-slate-700">{activeClient.lastService}</span> · Ultimo: <span className="font-mono tabular-nums text-slate-700">{activeClient.lastContactDate}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="Nome cliente (es. Marco Rossi)"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <input
                    type="text"
                    value={customClientService}
                    onChange={(e) => setCustomClientService(e.target.value)}
                    placeholder="Ultimo servizio (es. Consulenza fiscale)"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Motivo del Contatto */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Motivo del Recall
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
              >
                <option value="Check-in periodico / Controllo di routine">Check-in periodico / Controllo di routine</option>
                <option value="Follow-up post seduta o servizio">Follow-up post seduta o servizio</option>
                <option value="Proposta rinnovo o nuovo pacchetto">Proposta rinnovo o nuovo pacchetto</option>
                <option value="Anniversario / Auguri cliente">Anniversario / Auguri cliente</option>
                <option value="Riattivazione cliente inattivo">Riattivazione cliente inattivo</option>
                <option value="Disponibilità limitata / Nuovi slot in agenda">Disponibilità limitata / Nuovi slot in agenda</option>
                <option value="Richiesta feedback o recensione">Richiesta feedback o recensione</option>
              </select>
            </div>

            {/* Canale */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Canale
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> },
                  { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-sky-600" /> },
                  { id: 'sms', label: 'SMS', icon: <Smartphone className="w-3.5 h-3.5 text-amber-600" /> },
                  { id: 'dm', label: 'Social DM', icon: <MessageCircle className="w-3.5 h-3.5 text-indigo-600" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setChannel(item.id as RecallChannel)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      channel === item.id
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tono & Lunghezza */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Tono
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                >
                  <option value="Caldo e amichevole">Caldo e amichevole</option>
                  <option value="Professionale ed elegante">Professionale ed elegante</option>
                  <option value="Diretto e sintetico">Diretto e sintetico</option>
                  <option value="Empatico e rassicurante">Empatico e rassicurante</option>
                  <option value="Commerciale soft">Commerciale soft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Lunghezza
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                >
                  <option value="Breve (sintetico)">Breve (~2-3 frasi)</option>
                  <option value="Medio (equilibrato)">Medio (bilanciato)</option>
                  <option value="Dettagliato (approfondito)">Dettagliato</option>
                </select>
              </div>
            </div>

            {/* Contesto specifico */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Dettagli Extra o Offerta
              </label>
              <textarea
                rows={2}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="es. Si era trovato bene con il massaggio decontratturante; proporre lo slot di martedì."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none text-slate-800 leading-relaxed"
              />
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-[0.99]"
            >
              <Sparkles className={`w-4 h-4 text-indigo-200 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generazione in corso...' : 'Rigenera Varianti'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Output Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Header with Variant Tabs & Preview Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bozza per {getEffectiveClientName()}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Canale: <span className="uppercase font-semibold text-slate-700">{channel}</span> · Tono: {tone}
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setPreviewMode('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      previewMode === 'editor'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editor</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      previewMode === 'preview'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Anteprima</span>
                  </button>
                </div>
              </div>

              {/* Variant Tabs */}
              {generatedOptions.length > 0 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                  {generatedOptions.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all border ${
                        selectedOptionId === opt.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <span>Opzione {idx + 1}: {opt.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Content Body (Editor or Smartphone Preview) */}
              {previewMode === 'editor' ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Modifica il testo liberamente:</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span>{wordCount} parole</span>
                      <span>·</span>
                      <span className={isSMS && characterCount > 160 ? 'text-rose-600 font-bold' : ''}>
                        {characterCount} {isSMS ? '/ 160 car.' : 'caratteri'}
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={channel === 'email' ? 13 : 10}
                    value={editedText}
                    onChange={(e) => {
                      setEditedText(e.target.value);
                      setIsCopied(false);
                    }}
                    className="w-full p-4 sm:p-5 text-sm bg-slate-50/60 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-sans leading-relaxed text-slate-800 resize-y"
                    placeholder="Il testo del messaggio apparirà qui..."
                  />

                  {isSMS && characterCount > 160 && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
                      Attenzione: il testo supera i 160 caratteri consigliati per un singolo SMS.
                    </p>
                  )}
                </div>
              ) : (
                /* Realistic Simulated Chat / Email Bubble */
                <div className="mt-4 p-6 bg-slate-100/70 rounded-2xl border border-slate-200/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-700">
                      Anteprima invio ({channel.toUpperCase()})
                    </span>
                    <span className="text-[11px] text-slate-400">Destinatario: {getEffectiveClientName()}</span>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/70 max-w-lg space-y-2">
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {editedText}
                    </p>
                    <div className="flex justify-end pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">10:42</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveHistory}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salva in Cronologia</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateReminder}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
                >
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  <span>Promemoria (+7 gg)</span>
                </button>
              </div>

              {/* Main Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-[0.98] ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiato negli Appunti!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 opacity-80" />
                    <span>Copia Messaggio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
