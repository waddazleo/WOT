
import React, { useState, useEffect } from 'react';
import { X, Flame, Loader2, Move, Activity, TrendingUp } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, WeekDay } from '../types';

interface WarmupModalProps {
  dayInfo: WeekDay;
  exercises: Exercise[];
  onClose: () => void;
}

interface DetailedExercise {
  name: string;
  instruction: string;
}

interface WarmupPlan {
  mobility: DetailedExercise[];
  activation: DetailedExercise[];
  potentiation: string;
}

const WarmupModal: React.FC<WarmupModalProps> = ({ dayInfo, exercises, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<WarmupPlan | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWarmup = async () => {
      if (!process.env.API_KEY) {
        setError("API Key mancante.");
        setLoading(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const exerciseList = exercises.map(e => e.name).join(', ');
        
        const prompt = `Agisci come un coach esperto di ipertrofia e biomeccanica aggiornato sugli ultimi studi scientifici.
        Crea una routine di riscaldamento specifica per la sessione di oggi: "${dayInfo.focus}".
        
        Esercizi previsti: ${exerciseList}.

        Struttura la risposta in 3 fasi:
        1. Mobilità Articolare (Joint Mobility): Movimenti dinamici specifici per le articolazioni coinvolte. IMPORTANTE: Per ogni esercizio, fornisci una spiegazione pratica su come eseguirlo.
        2. Attivazione Specifica (Activation): Esercizi a basso carico per attivare i muscoli target. IMPORTANTE: Per ogni esercizio, fornisci una spiegazione pratica su come eseguirlo.
        3. Avvicinamento al carico (Potentiation): Consigli su come gestire le serie di avvicinamento (warm-up sets) per il primo esercizio composto.

        Rispondi in JSON:
        {
          "mobility": [
             { "name": "Nome Esercizio", "instruction": "Spiegazione breve e pratica su come fare il movimento..." }
          ],
          "activation": [
            { "name": "Nome Esercizio", "instruction": "Spiegazione breve e pratica su come fare il movimento..." }
          ],
          "potentiation": "Consiglio specifico..."
        }`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mobility: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      instruction: { type: Type.STRING }
                    },
                    required: ["name", "instruction"]
                  } 
                },
                activation: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      instruction: { type: Type.STRING }
                    },
                    required: ["name", "instruction"]
                  } 
                },
                potentiation: { type: Type.STRING }
              },
              required: ["mobility", "activation", "potentiation"]
            }
          }
        });

        if (response.text) {
          setPlan(JSON.parse(response.text));
        } else {
          setError("Errore nella generazione della risposta.");
        }
      } catch (err) {
        console.error(err);
        setError("Impossibile contattare l'AI al momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchWarmup();
  }, [dayInfo, exercises]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-coral-100 flex justify-between items-center bg-gradient-to-r from-coral-50 to-white">
          <div className="flex items-center gap-2 text-coral-800">
            <div className="bg-white p-2 rounded-full shadow-sm">
                <Flame className="text-coral-500 fill-coral-500" size={20} />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-none">Smart Warm-up</h3>
                <span className="text-[10px] font-bold text-coral-400 uppercase tracking-wider">Scientific Approach</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-coral-100 text-coral-300 hover:text-coral-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto bg-offwhite-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 size={32} className="animate-spin text-coral-500" />
              <p className="text-sm text-navy-400 font-medium animate-pulse">Analisi biomeccanica della sessione...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-coral-500">
              <p>{error}</p>
            </div>
          ) : plan ? (
            <div className="flex flex-col gap-0">
                
                {/* Phase 1: Mobility */}
                <div className="p-5 border-b border-navy-100 bg-white">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
                        <Move size={14} /> Fase 1: Mobilità Articolare
                    </h4>
                    <ul className="space-y-4">
                        {plan.mobility.map((item, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-charcoal-800 items-start">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-mint-400 mt-1.5"></span>
                                <div className="flex flex-col">
                                  <span className="font-bold text-navy-900">{item.name}</span>
                                  <span className="text-xs text-navy-500 mt-0.5 leading-relaxed">{item.instruction}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Phase 2: Activation */}
                <div className="p-5 border-b border-navy-100 bg-white">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
                        <Activity size={14} /> Fase 2: Attivazione Neurale
                    </h4>
                    <ul className="space-y-4">
                        {plan.activation.map((item, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-charcoal-800 items-start">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-coral-400 mt-1.5"></span>
                                <div className="flex flex-col">
                                  <span className="font-bold text-navy-900">{item.name}</span>
                                  <span className="text-xs text-navy-500 mt-0.5 leading-relaxed">{item.instruction}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                 {/* Phase 3: Potentiation */}
                 <div className="p-5 bg-gradient-to-b from-navy-50 to-white">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-navy-400 uppercase tracking-wider mb-3">
                        <TrendingUp size={14} /> Fase 3: Ramping Sets
                    </h4>
                    <div className="bg-white border border-navy-100 p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-charcoal-700 italic leading-relaxed">
                            "{plan.potentiation}"
                        </p>
                    </div>
                </div>

            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-navy-100 text-center text-[10px] text-navy-300">
            Generato da AI su base scientifica per l'ipertrofia
        </div>

      </div>
    </div>
  );
};

export default WarmupModal;
