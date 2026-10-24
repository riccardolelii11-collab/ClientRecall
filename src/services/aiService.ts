import { RecallGenerationRequest, GeneratedOption, UserProfile } from '../types';

export const aiService = {
  async generateRecallMessages(
    req: RecallGenerationRequest,
    profile: UserProfile
  ): Promise<{ options: GeneratedOption[]; source: string }> {
    try {
      const response = await fetch('/api/generate-recall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: req.clientName,
          clientService: req.clientService,
          clientNotes: req.clientNotes,
          lastContactDaysAgo: req.lastContactDaysAgo,
          reason: req.reason,
          channel: req.channel,
          tone: req.tone,
          length: req.length,
          customContext: req.customContext,
          professionalName: profile.name,
          businessName: profile.businessName,
          businessField: profile.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          return { options: data.options, source: data.source || 'gemini' };
        }
      }
    } catch {
      // Graceful fallback to client generation engine
    }

    return {
      options: this.generateClientSideMessages(req, profile),
      source: 'client-engine',
    };
  },

  generateClientSideMessages(req: RecallGenerationRequest, profile: UserProfile): GeneratedOption[] {
    const clientName = req.clientName?.trim() || 'Gentile Cliente';
    const service = req.clientService?.trim() || 'l’ultima sessione insieme';
    const proName = profile.name?.trim() || 'Il tuo professionista';
    const biz = profile.businessName?.trim() || '';
    const extra = req.customContext?.trim() ? ` ${req.customContext.trim()}` : '';
    const channel = (req.channel || 'whatsapp').toLowerCase();
    const reason = req.reason || 'Check-in periodico';
    const tone = req.tone || 'Caldo e amichevole';
    const length = req.length || 'Medio';

    const isEmail = channel.includes('email');
    const isSMS = channel.includes('sms');

    if (isSMS) {
      return [
        {
          id: 'opt-sms-1',
          title: 'Sintetico & Cordiale',
          text: `Ciao ${clientName}, spero tutto bene! Ti scrivo da ${biz || proName} per sapere come procede dopo ${service}.${extra} Un saluto, ${proName}`,
        },
        {
          id: 'opt-sms-2',
          title: 'Check-in Disponibilità',
          text: `Ciao ${clientName}, è tempo di un rapido controllo per ${service}. Ho alcuni orari liberi per le prossime settimane. Se vuoi fare un punto: ${proName}`,
        },
        {
          id: 'opt-sms-3',
          title: 'Promemoria Diretto',
          text: `Ciao ${clientName}! Promemoria amichevole per ${service}.${extra} Fammi sapere se desideri fissare un momento dedicato. Buona giornata, ${proName}`,
        },
      ];
    }

    if (isEmail) {
      const formalGreeting = tone.includes('Formale') || tone.includes('Professionale')
        ? `Gentile ${clientName},`
        : `Gentile ${clientName}, spero che questo messaggio ti trovi bene.`;

      return [
        {
          id: 'opt-em-1',
          title: 'Relazionale & Professionale',
          text: `Oggetto: Un cordiale saluto e aggiornamento post ${service}

${formalGreeting}

Ti contatto con piacere per sapere come stanno procedendo le cose a seguito del nostro incontro dedicato a ${service}. Per me è prioritario accertarmi che i risultati siano all'altezza delle tue aspettative e che non siano insorte nuove necessità o dubbi.

${extra ? extra + '\n\n' : ''}In base al percorso impostato, questo potrebbe essere il momento opportuno per fare un rapido punto della situazione o pianificare il prossimo passo.

Se hai piacere di confrontarti, rimango volentieri a tua disposizione. Puoi rispondere direttamente a questa email indicandomi i giorni o gli orari che ti sono più comodi.

Un caro saluto,
${proName}
${biz ? biz + '\n' : ''}${profile.email ? profile.email : ''}`,
        },
        {
          id: 'opt-em-2',
          title: 'Diretta & Operativa',
          text: `Oggetto: Verifica andamento e prossimi appuntamenti - ${biz || proName}

Gentile ${clientName},

ti scrivo un breve aggiornamento relativo a ${service}.

Avendo completato l'attività iniziale, desidero verificare con te se tutto procede secondo i piani concordati o se desideri impostare la fase successiva.${extra ? '\n\n' + extra : ''}

Attualmente ho delle aperture in calendario nelle prossime due settimane. Se vuoi riservare uno spazio dedicato prima che gli slot si esauriscano, fammi sapere le tue preferenze.

Resto a disposizione per qualsiasi chiarimento.

Cordiali saluti,
${proName}`,
        },
        {
          id: 'opt-em-3',
          title: 'Proposta di Valore & Rinnovo',
          text: `Oggetto: Priorità e disponibilità riservata per te - ${biz || proName}

Gentile ${clientName},

è trascorso del tempo dal nostro ultimo lavoro su ${service} e spero che le attività stiano dando i frutti desiderati.

Sto programmando l'agenda per il prossimo periodo: prima di aprire le disponibilità a nuove richieste, ho molto piacere di ricontattare i clienti con cui ho già collaborato con soddisfazione.

${extra ? extra + '\n\n' : ''}Se desideri proseguire il percorso o concordare una revisione mirata, sarò felice di organizzare un momento su misura.

A presto,
${proName}
${biz}`,
        },
      ];
    }

    // Default WhatsApp & Direct Message
    if (reason.toLowerCase().includes('feedback') || reason.toLowerCase().includes('recensione')) {
      return [
        {
          id: 'opt-fb-1',
          title: 'Ascolto & Cura',
          text: `Ciao ${clientName}! Spero stia andando tutto alla grande 😊\n\nCi tenevo a ringraziarti ancora per la fiducia su ${service}. La tua opinione per me è preziosissima: come ti sei trovato/a complessivamente? C'è qualcosa che possiamo migliorare o approfondire?\n\nSe ti fa piacere condividere due righe di feedback, mi faresti un regalo enorme! A presto, ${proName}`,
        },
        {
          id: 'opt-fb-2',
          title: 'Sintetico & Leggero',
          text: `Ciao ${clientName}, spero tu stia passando una buona settimana!\n\nVolevo solo chiederti se hai un minuto per dirmi come ti sei trovato con ${service}.${extra ? ' ' + extra : ''} Il tuo parere mi aiuta a perfezionare costantemente il servizio!\n\nUn abbraccio, ${proName}`,
        },
        {
          id: 'opt-fb-3',
          title: 'Con Link Recensione',
          text: `Ciao ${clientName}! 👋 Spero che i benefici di ${service} stiano continuando!\n\nSe sei rimasto soddisfatto del lavoro svolto insieme, ti andrebbe di lasciarmi una breve recensione a questo link? Per un'attività indipendente come la mia fa davvero la differenza! 🌟\n\nGrazie di cuore e un caro saluto, ${proName}`,
        },
      ];
    }

    if (reason.toLowerCase().includes('rinnovo') || reason.toLowerCase().includes('offerta')) {
      return [
        {
          id: 'opt-rn-1',
          title: 'Proposta Riservata',
          text: `Ciao ${clientName}! Spero tutto bene 😊\n\nVisto che è trascorso un po' di tempo da ${service}, volevo farti sapere che sto aprendo le nuove disponibilità per le prossime settimane. ${extra ? '\n\n' + extra : ''}\n\nMi fa molto piacere dare la precedenza a chi già mi conosce: se vuoi proseguire il percorso, scrivimi pure qui così ti riservo l'orario migliore!\n\nA presto, ${proName}`,
        },
        {
          id: 'opt-rn-2',
          title: 'Diretta & Chiara',
          text: `Ciao ${clientName}, come stai? Ti contatto perché in questo periodo molti clienti stanno pianificando il rinnovo per ${service}.${extra ? ' ' + extra : ''}\n\nSe hai piacere di fissare la prossima data prima che si riempia l'agenda, fammi sapere le tue disponibilità.\n\nBuona giornata! ${proName}`,
        },
        {
          id: 'opt-rn-3',
          title: 'Approccio Soft & Senza Impegno',
          text: `Ciao ${clientName}! Un saluto veloce. Pensavo al nostro percorso su ${service} e mi farebbe piacere sapere come ti senti oggi.\n\nNessuna pressione: se senti il bisogno di una nuova seduta o di un aggiornamento, sai dove trovarmi. Sono qui per qualsiasi consiglio! 😊\n\nUn caro saluto, ${proName}`,
        },
      ];
    }

    // Standard Check-in / Recall options
    return [
      {
        id: 'opt-std-1',
        title: 'Calda & Relazionale',
        text: `Ciao ${clientName}! Come stai? Spero che la settimana stia procedendo bene 😊\n\nTi scrivo un attimo per sapere come vanno le cose a distanza di qualche tempo da ${service}. Ci tenevo sinceramente a fare un check e sapere se è tutto a posto o se avverti ancora qualche fastidio o necessità.${extra ? '\n\n' + extra : ''}\n\nFammi sapere con calma quando ti è più comodo!\n\nUn caro saluto, ${proName}`,
      },
      {
        id: 'opt-std-2',
        title: 'Diretta & Sintetica',
        text: `Ciao ${clientName}, spero tutto bene! È passato un po' dal nostro ultimo incontro per ${service}. Volevo fare un rapido punto della situazione: come procede?${extra ? ' ' + extra : ''}\n\nSe vuoi programmare un controllo o hai qualche domanda, rispondimi pure qui.\n\nA presto, ${proName}`,
      },
      {
        id: 'opt-std-3',
        title: 'Con Disponibilità Agenda',
        text: `Ciao ${clientName}! 👋 Sto aggiornando l'agenda per le prossime settimane e ho pensato a te. In base al lavoro fatto con ${service}, questo è solitamente il momento consigliato per fare una verifica di mantenimento.${extra ? '\n\n' + extra : ''}\n\nSe ti va di bloccare uno slot comodo senza impegno, dimmi pure quali giorni preferisci!\n\nBuona giornata, ${proName}`,
      },
    ];
  },
};
