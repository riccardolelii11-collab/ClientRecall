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
          profession: profile.profession,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          return { options: data.options, source: data.source || 'gemini' };
        }
      }
    } catch {
      // Fallback to client generation engine
    }

    return {
      options: this.generateClientSideMessages(req, profile),
      source: 'client-engine',
    };
  },

  generateClientSideMessages(req: RecallGenerationRequest, profile: UserProfile): GeneratedOption[] {
    const clientName = req.clientName?.trim() || 'Gentile Cliente';
    const service = req.clientService?.trim() || 'l’ultimo appuntamento insieme';
    const proName = profile.name?.trim() || 'Il tuo professionista';
    const biz = profile.businessName?.trim() || '';
    const extra = req.customContext?.trim() ? ` ${req.customContext.trim()}` : '';
    const channel = (req.channel || 'whatsapp').toLowerCase();
    const profession = (profile.profession || req.profession || 'barbiere').toLowerCase();
    const daysAgo = req.lastContactDaysAgo ? `circa ${req.lastContactDaysAgo} giorni` : "un po' di tempo";

    const isEmail = channel.includes('email');
    const isSMS = channel.includes('sms');

    // SMS: Breve, sintetico (<160 caratteri)
    if (isSMS) {
      if (profession.includes('barb')) {
        return [
          {
            id: 'opt-sms-1',
            title: 'Rinfresco Taglio & Barba',
            text: `Ciao ${clientName}! È trascorso ${daysAgo} dall'ultimo taglio. Ho qualche disponibilità per giovedì/venerdì se vuoi sistemare il look. A presto, ${biz || proName}`,
          },
          {
            id: 'opt-sms-2',
            title: 'Check rapido slot',
            text: `Ciao ${clientName}, promemoria per ${service}! Sto aggiornando gli slot della settimana: fammi sapere se vuoi bloccare il tuo orario. ${proName}`,
          },
        ];
      }

      if (profession.includes('parrucch')) {
        return [
          {
            id: 'opt-sms-1',
            title: 'Ritocco & Cura',
            text: `Ciao ${clientName}! È trascorso ${daysAgo} da ${service}. Se vuoi rinfrescare piega o colore prima del fine settimana, scrivimi! ${biz || proName}`,
          },
          {
            id: 'opt-sms-2',
            title: 'Promemoria Salone',
            text: `Ciao ${clientName}, spero tutto bene! Ho ancora qualche posto libero per la prossima settimana per ${service}. Buona giornata, ${proName}`,
          },
        ];
      }

      if (profession.includes('fisio') || profession.includes('osteo')) {
        return [
          {
            id: 'opt-sms-1',
            title: 'Controllo Benessere',
            text: `Ciao ${clientName}, come procede dopo ${service}? Volevo fare un check e sapere se la postura/il fastidio è migliorato. ${proName}`,
          },
          {
            id: 'opt-sms-2',
            title: 'Seduta di Mantenimento',
            text: `Ciao ${clientName}! È il momento consigliato per il controllo di mantenimento post ${service}. Se vuoi fare il punto: ${proName}`,
          },
        ];
      }

      // SMS Generico / Estetica / Trainer
      return [
        {
          id: 'opt-sms-1',
          title: 'Sintetico & Cordiale',
          text: `Ciao ${clientName}, spero tutto bene! Ti scrivo da ${biz || proName} per sapere come procede dopo ${service}.${extra} Un saluto, ${proName}`,
        },
        {
          id: 'opt-sms-2',
          title: 'Check Disponibilità',
          text: `Ciao ${clientName}, è tempo di un rapido controllo per ${service}. Ho alcuni orari liberi per le prossime settimane se vuoi fissare: ${proName}`,
        },
      ];
    }

    // EMAIL: Più formale e strutturata
    if (isEmail) {
      return [
        {
          id: 'opt-em-1',
          title: 'Professionale & Attenta',
          text: `Oggetto: Un saluto e aggiornamento dopo ${service} - ${biz || proName}

Gentile ${clientName},

spero che la settimana stia procedendo per il meglio.

Ti contatto con piacere per sapere come stanno andando le cose a seguito del nostro appuntamento dedicato a ${service}. Per me è fondamentale accertarmi che i risultati siano pienamente soddisfacenti e duraturi nel tempo.

${extra ? extra + '\n\n' : ''}In base al percorso abituale e al tempo trascorso, questo è il momento ideale per valutare se programmare un controllo o proseguire con la cura necessaria.

Se desideri riservare uno spazio dedicato o hai domande, puoi rispondere direttamente a questa email indicandomi le tue disponibilità di giorni e orari.

Un caro saluto,
${proName}
${biz ? biz + '\n' : ''}${profile.phone ? 'Tel: ' + profile.phone : ''}`,
        },
        {
          id: 'opt-em-2',
          title: 'Diretta & Operativa',
          text: `Oggetto: Disponibilità in agenda per il prossimo appuntamento (${service})

Gentile ${clientName},

è trascorso ${daysAgo} dal nostro ultimo incontro dedicato a ${service}.

Sto attualmente organizzando le disponibilità in agenda per le prossime due settimane e, prima di aprire gli orari ad altre prenotazioni, ho il piacere di ricontattare i miei clienti abituali.

${extra ? extra + '\n\n' : ''}Se hai piacere di fissare la prossima data all'orario che ti è più comodo, fammi sapere le tue preferenze.

Resto a tua completa disposizione.

Cordiali saluti,
${proName}
${biz}`,
        },
      ];
    }

    // WHATSAPP & CANALI DIRETTI (specifici per professione)
    if (profession.includes('barb')) {
      return [
        {
          id: 'opt-w-1',
          title: 'Amichevole & Look in Ordine',
          text: `Ciao ${clientName}! Come stai? Spero che la settimana stia andando bene 😊\n\nÈ passato ${daysAgo} dall'ultimo ${service} e immagino sia arrivato il momento di rinfrescare il taglio e sistemare la barba prima che perda la forma! ✂️\n\nSto organizzando l'agenda per questa e la prossima settimana: se vuoi passare, scrivimi pure che ti blocco un orario comodo.${extra ? '\n\n' + extra : ''}\n\nA presto!\n${proName} (${biz || 'Barberia'})`,
        },
        {
          id: 'opt-w-2',
          title: 'Diretto con Proposta Slot',
          text: `Ciao ${clientName}! 👋 Veloce promemoria per il taglio: sono passate circa ${req.lastContactDaysAgo ? Math.round(req.lastContactDaysAgo / 7) : 3} settimane dall'ultima volta.\n\nHo ancora qualche posto libero giovedì pomeriggio e venerdì mattina. Se vuoi rimettere in ordine il look, fammi un fischio e ti tengo il posto!\n\nBuona giornata, ${proName}`,
        },
        {
          id: 'opt-w-3',
          title: 'Soft & Riconoscimento',
          text: `Ciao ${clientName}, spero tutto alla grande! Ci tenevo a ringraziarti ancora per essere passato l'ultima volta. Come sta tenendo il taglio? Se hai bisogno di una rifinitura prima del weekend, sai dove trovarmi! 😉 A presto, ${proName}`,
        },
      ];
    }

    if (profession.includes('parrucch')) {
      return [
        {
          id: 'opt-w-1',
          title: 'Cura del Capello & Mantenimento',
          text: `Ciao ${clientName}! Spero tu stia passando una splendida settimana ✨\n\nTi scrivo perché è trascorso ${daysAgo} dal nostro lavoro su ${service}. Solitamente questo è il periodo ideale per rinfrescare il colore, fare un trattamento nutriente o riprendere la piega affinché la chioma resti impeccabile e lucida! 💇‍♀️\n\n${extra ? extra + '\n\n' : ''}Se vuoi dedicarti un momento di relax in salone, dimmi pure quali giorni ti tornano meglio e ti riservo un appuntamento con piacere.\n\nUn abbraccio, ${proName}`,
        },
        {
          id: 'opt-w-2',
          title: 'Nuove Aperture Salone',
          text: `Ciao ${clientName}! 👋 Sto sistemando l'agenda per le prossime settimane. Visto il tempo trascorso da ${service}, volevo darti la precedenza prima che i fine settimana si riempiano.\n\nSe vuoi passare per una sistemata, rispondimi qui e troviamo l'orario perfetto per te!\n\nA presto, ${proName}`,
        },
      ];
    }

    if (profession.includes('estet')) {
      return [
        {
          id: 'opt-w-1',
          title: 'Benessere & Risultati Duraturi',
          text: `Ciao ${clientName}! Come stai? Spero tutto bene 😊\n\nÈ trascorso ${daysAgo} da ${service}. Per mantenere la pelle idratata e far durare i benefici del trattamento al massimo, questo è solitamente il momento consigliato per il richiamo periodico! 🌸\n\n${extra ? extra + '\n\n' : ''}Se hai voglia di concederti una pausa di benessere, scrivimi pure le tue preferenze e ti riservo il posto migliore.\n\nA presto! ${proName}`,
        },
        {
          id: 'opt-w-2',
          title: 'Promemoria Delicato',
          text: `Ciao ${clientName}! Un caro saluto. Volevo sapere come ti sei trovata nei giorni successivi a ${service} e ricordarti che quando vuoi ripetere la seduta o fare un check, le disponibilità per la prossima settimana sono aperte.\n\nUn abbraccio, ${proName}`,
        },
      ];
    }

    if (profession.includes('fisio') || profession.includes('osteo')) {
      return [
        {
          id: 'opt-w-1',
          title: 'Controllo Clinico & Postura',
          text: `Ciao ${clientName}! Come stai? Ci tenevo a fare un breve controllo per sapere come procede la situazione dopo ${service} svolto ${daysAgo} fa.\n\nIl fastidio/la mobilità è migliorata? Gli esercizi o le indicazioni posturali stanno dando sollievo?${extra ? '\n\n' + extra : ''}\n\nSe senti il bisogno di fare un punto della situazione o una seduta di mantenimento, fammi sapere senza impegno.\n\nUn saluto, ${proName}`,
        },
        {
          id: 'opt-w-2',
          title: 'Richiamo di Mantenimento',
          text: `Gentile ${clientName}, un saluto. In base al ciclo terapeutico concordato per ${service}, questo è l'intervallo temporale raccomandato per consolidare i benefici ed evitare ricadute.\n\nSe desideri programmare la seduta di controllo, puoi indicarmi i giorni per te più agevoli.\n\nCordiali saluti, ${proName}`,
        },
      ];
    }

    // Default generico
    return [
      {
        id: 'opt-w-1',
        title: 'Calda & Relazionale',
        text: `Ciao ${clientName}! Come stai? Spero che la settimana stia procedendo per il meglio 😊\n\nÈ trascorso ${daysAgo} dal nostro ultimo appuntamento per ${service} e ci tenevo a fare un breve check per sapere come stanno andando le cose.${extra ? '\n\n' + extra : ''}\n\nSe hai piacere di fissare il prossimo controllo o vuoi passare a trovarmi, scrivimi pure qui e troviamo l'orario ideale!\n\nUn caro saluto, ${proName}`,
      },
      {
        id: 'opt-w-2',
        title: 'Diretta & con Slot Agenda',
        text: `Ciao ${clientName}! 👋 Visto il tempo trascorso da ${service}, sto aggiornando le disponibilità per le prossime settimane.\n\nPrima di aprire l'agenda ad altre richieste, mi fa piacere ricontattarti: se vuoi bloccare il tuo consueto appuntamento, fammi sapere quali giorni preferisci!\n\nA presto, ${proName}`,
      },
    ];
  },
};
