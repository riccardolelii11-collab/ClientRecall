import React from 'react';
import {
  CalendarRange,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
} from 'lucide-react';

export const ImportsView: React.FC = () => {
  const downloadSampleCsv = () => {
    const csvContent =
      'Nome,Telefono,Email,Servizio,Data_Ultimo_Appuntamento,Intervallo_Giorni,Note\n' +
      'Marco Rossi,+39 340 1234567,marco@example.com,Taglio Capelli,2026-09-12,21,Preferisce giovedi pomeriggio\n' +
      'Giulia Bianchi,+39 338 9876543,giulia@example.com,Trattamento,2026-09-28,28,Attenta alla puntualita\n' +
      'Alessandro Ferrari,+39 349 5554321,a.ferrari@example.com,Seduta,2026-10-18,30,Nuovo cliente';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clientrecall_template_clienti.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl border border-teal-900/10 p-5 sm:p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Roadmap & Architettura
          </span>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
            Funzionalità Pianificate
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Integrazioni & Importazioni Future
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          ClientRecall è predisposto per collegarsi alla tua agenda esistente e importare elenchi
          clienti da fogli di calcolo. Queste integrazioni sono illustrate in modo trasparente e
          verranno abilitate gradualmente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Google Calendar Integration */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Sola Lettura (Read-Only)
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sincronizzazione Google Calendar
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Permetterà di leggere gli eventi del tuo calendario per rilevare automaticamente le
                date degli appuntamenti passati e futuri, senza mai modificare o cancellare i tuoi
                impegni.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Come funzionerà:
              </span>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Accesso protetto tramite OAuth 2.0 con permessi ristretti in sola lettura.</li>
                <li>Riconoscimento del nome del cliente nel titolo dell'evento dell'agenda.</li>
                <li>
                  Rilevamento degli appuntamenti futuri per <strong>escludere i recall inutili</strong>.
                </li>
                <li>Nessun dato del tuo calendario verrà sovrascritto.</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>In arrivo con Google OAuth</span>
            </div>

            <button
              disabled
              className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed border border-slate-200/60"
            >
              Non Attivo in questa Demo
            </button>
          </div>
        </div>

        {/* 2. CSV / Excel Import */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                File .CSV / .XLSX
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Caricamento Elenchi Clienti da File
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consente di migrare velocemente rubriche e appuntamenti storici da un foglio Excel o
                dal gestionale che usi abitualmente nel database Supabase.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Formato colonne supportato:
              </span>
              <p className="font-mono text-[11px] text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 overflow-x-auto whitespace-nowrap">
                Nome, Telefono, Email, Servizio, Data_Ultimo_Appuntamento, Intervallo_Giorni
              </p>
              <p className="text-[11px] text-slate-500">
                Puoi scaricare il file modello per verificare la struttura esatta dei dati.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={downloadSampleCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica Modello CSV</span>
            </button>

            <button
              disabled
              className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed border border-slate-200/60"
            >
              Caricamento Pianificato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
