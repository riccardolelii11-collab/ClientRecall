import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for AI Recall Message Generation
  app.post('/api/generate-recall', async (req, res) => {
    try {
      const {
        clientName,
        clientService,
        clientNotes,
        lastContactDaysAgo,
        reason,
        channel,
        tone,
        length,
        customContext,
        professionalName,
        businessName,
        businessField,
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.startsWith('MY_')) {
        // Instant response with structured generator if no key configured or placeholder
        return res.json({
          success: true,
          source: 'local-engine',
          options: generateFallbackMessages({
            clientName,
            clientService,
            reason,
            channel,
            tone,
            length,
            customContext,
            professionalName: professionalName || 'Il tuo professionista',
            businessName: businessName || 'Studio',
          }),
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Sei l'assistente di scrittura per "ClientRecall", un software per liberi professionisti e piccole attività indipendenti.
Il tuo compito è scrivere 3 opzioni diverse di messaggi personalizzati in italiano per ricontattare un cliente al momento giusto.

Informazioni sul professionista:
- Nome: ${professionalName || 'Professionista'}
- Attività/Studio: ${businessName || 'Attività'}
- Settore: ${businessField || 'Servizi'}

Informazioni sul cliente:
- Nome: ${clientName || 'Cliente'}
- Servizio/prodotto avuto: ${clientService || 'consulenza/trattamento'}
- Note sul cliente: ${clientNotes || 'Nessuna nota specifica'}
- Giorni trascorsi dall'ultimo contatto: ${lastContactDaysAgo ?? 'alcune settimane'}

Parametri del messaggio richiesto:
- Motivo del ricontatto: ${reason}
- Canale scelto: ${channel} (es. WhatsApp, Email, SMS, DM)
- Tono di voce desiderato: ${tone}
- Lunghezza desiderata: ${length}
- Dettagli extra / offerta / contesto specifico fornito dall'utente: ${customContext || 'Nessuno'}

REGOLE FONDAMENTALI:
1. NON deve sembrare un messaggio promozionale massivo o spam! Deve sembrare autentico, scritto a mano da una persona reale e premurosa.
2. Rispetta rigorosamente il canale (${channel}):
   - Se WhatsApp: usa qualche emoji calibrata, formattazione con asterischi per il grassetto se utile, tono diretto ma umano.
   - Se Email: includi SEMPRE una riga con "Oggetto: ..." all'inizio, seguita dal testo formattato.
   - Se SMS: testo super compatto, d'impatto, entro ~160 caratteri.
   - Se DM: tono moderno e snello.
3. Rispetta la lunghezza (${length}):
   - "Breve": 2-3 frasi chiare.
   - "Medio": 4-6 frasi equilibrate con saluto, richiamo al servizio precedente e proposta non invasiva.
   - "Dettagliato": testo più articolato con contesto, proposta e disponibilità.
4. Fornisci ESATTAMENTE 3 varianti diverse:
   - Opzione 1: Naturale, calda e relazionale (focalizzata sulla relazione e sul benessere/risultato del cliente).
   - Opzione 2: Diretta e sintetica (focalizzata sul punto, pratica e orientata all'azione).
   - Opzione 3: Con proposta specifica o disponibilità slot (soft call-to-action).

Rispondi ESCLUSIVAMENTE in formato JSON valido conforme a questo schema (senza blocchi markdown extra se possibile):
{
  "options": [
    {
      "id": "1",
      "title": "Calda & Relazionale",
      "text": "..."
    },
    {
      "id": "2",
      "title": "Diretta & Sintetica",
      "text": "..."
    },
    {
      "id": "3",
      "title": "Con Proposta / Disponibilità",
      "text": "..."
    }
  ]
}`;

      const genPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
      );

      const response = (await Promise.race([genPromise, timeoutPromise])) as any;

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        if (parsed.options && Array.isArray(parsed.options)) {
          return res.json({ success: true, source: 'gemini', options: parsed.options });
        }
      } catch (err) {
        console.warn('JSON parse issue from Gemini response:', err);
      }

      // If parsing fails, fallback gracefully
      return res.json({
        success: true,
        source: 'local-engine',
        options: generateFallbackMessages({
          clientName,
          clientService,
          reason,
          channel,
          tone,
          length,
          customContext,
          professionalName,
          businessName,
        }),
      });
    } catch (error: any) {
      console.error('Error in /api/generate-recall:', error);
      return res.json({
        success: true,
        source: 'local-engine',
        options: generateFallbackMessages({
          clientName: req.body?.clientName,
          clientService: req.body?.clientService,
          reason: req.body?.reason,
          channel: req.body?.channel,
          tone: req.body?.tone,
          length: req.body?.length,
          customContext: req.body?.customContext,
          professionalName: req.body?.professionalName,
          businessName: req.body?.businessName,
        }),
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ClientRecall API' });
  });

  // Dev server or prod static
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClientRecall server running at http://0.0.0.0:${PORT}`);
  });
}

// Built-in intelligent Italian generator for offline / fallback
function generateFallbackMessages(params: {
  clientName?: string;
  clientService?: string;
  reason?: string;
  channel?: string;
  tone?: string;
  length?: string;
  customContext?: string;
  professionalName?: string;
  businessName?: string;
}) {
  const name = params.clientName || 'Gentile Cliente';
  const service = params.clientService || 'il nostro ultimo servizio';
  const reason = params.reason || 'Check-in periodico';
  const channel = params.channel || 'WhatsApp';
  const pro = params.professionalName || 'Marco';
  const biz = params.businessName || 'Studio';
  const extra = params.customContext ? ` ${params.customContext}.` : '';

  const isEmail = channel.toLowerCase().includes('email');
  const isSMS = channel.toLowerCase().includes('sms');

  if (isSMS) {
    return [
      {
        id: '1',
        title: 'Sintetico & Diretto',
        text: `Ciao ${name}, spero tutto bene! Ti scrivo da ${biz} per un saluto e sapere come va dopo ${service}.${extra} A presto, ${pro}`,
      },
      {
        id: '2',
        title: 'Check-in Disponibilità',
        text: `Ciao ${name}, è passato un po' di tempo dall'ultima seduta di ${service}. Ho qualche disponibilità per le prossime settimane. Se vuoi fare un punto: ${pro} (${biz})`,
      },
      {
        id: '3',
        title: 'Invito Rapido',
        text: `Ciao ${name}! Un promemoria per il controllo periodico per ${service}.${extra} Fammi sapere se ti va di fissare. Un caro saluto, ${pro}`,
      },
    ];
  }

  if (isEmail) {
    return [
      {
        id: '1',
        title: 'Relazionale & Professionale',
        text: `Oggetto: Un caro saluto e check-in post ${service}

Gentile ${name},

spero che questo messaggio ti trovi bene.

Ti scrivo con piacere per sapere come stanno procedendo le cose a distanza di qualche tempo dal nostro ultimo lavoro su ${service}. Per me è fondamentale accertarmi che i risultati siano all'altezza delle tue aspettative e che non siano emerse nuove necessità.

${extra ? extra + '\n\n' : ''}Se hai piacere di fare un breve punto della situazione o necessiti di supporto, rimango a tua completa disposizione.

Un cordiale saluto,
${pro}
${biz}`,
      },
      {
        id: '2',
        title: 'Diretta & Focalizzata',
        text: `Oggetto: Controllo periodico e prossimi passi - ${biz}

Ciao ${name},

ti contatto per fare un rapido aggiornamento in merito a ${service}.

In base alla nostra pianificazione, questo è solitamente il periodo ideale per verificare l'andamento ed eventualmente programmare una sessione di revisione o controllo.

${extra ? extra + '\n\n' : ''}Se desideri riservare uno spazio nelle prossime settimane, puoi semplicemente rispondere a questa email con le tue disponibilità.

Buona giornata,
${pro}`,
      },
      {
        id: '3',
        title: 'Opportunità & Rinnovo',
        text: `Oggetto: Novità e disponibilità per te - ${biz}

Gentile ${name},

è passato un po' di tempo dall'ultima volta che abbiamo collaborato per ${service} e spero che tutto stia andando per il meglio.

Sto organizzando il calendario delle consulenze per il prossimo periodo e, prima di aprire gli slot a nuovi clienti, mi fa molto piacere dare priorità a chi ha già lavorato con me.

${extra ? extra + '\n\n' : ''}Se desideri proseguire il percorso o rinnovare l'attività, fammi sapere senza impegno.

A presto,
${pro}
${biz}`,
      },
    ];
  }

  // Default / WhatsApp / DM
  return [
    {
      id: '1',
      title: 'Calda & Personale',
      text: `Ciao ${name}! Spero stia procedendo tutto bene 😊\n\nTi scrivo un attimo per fare un saluto e sapere come ti stai trovando dopo ${service}. Ci tenevo a sapere come vanno le cose e se è tutto a posto!${extra ? '\n\n' + extra : ''}\n\nUn caro saluto, ${pro}`,
    },
    {
      id: '2',
      title: 'Diretta & Sintetica',
      text: `Ciao ${name}, come stai? È passato un po' di tempo dal nostro ultimo incontro per ${service}. Volevo fare un rapido check e sapere se ci sono novità o se hai bisogno di un aggiornamento.${extra ? ' ' + extra : ''}\n\nFammi sapere con calma quando ti è comodo! A presto, ${pro}`,
    },
    {
      id: '3',
      title: 'Con Invito all\'Azione Chiaro',
      text: `Ciao ${name}! 👋 Sto aggiornando l'agenda per le prossime settimane e ho pensato subito a te. Visto che sono passati un po' di giorni da ${service}, potrebbe essere il momento giusto per un controllo di routine o per pianificare i prossimi passi.${extra ? '\n\n' + extra : ''}\n\nSe vuoi che ti tenga da parte uno slot, scrivimi pure qui. Buona giornata! ${pro}`,
    },
  ];
}

startServer();
