import React, { useState, useEffect } from 'react';
import { Save, History, Layers, AlignJustify, Plus, X, Dumbbell, StickyNote, ArrowUp, ArrowDown, Sparkles, Search, Loader2, Trash2, ChevronDown, RefreshCcw, CircleHelp, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Exercise, LogEntry, SetData } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  lastLog?: LogEntry;
  onSave: (log: LogEntry) => void;
  onRemove?: () => void;
  
  // Reordering props
  isReordering?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

interface Alternative {
  name: string;
  reason: string;
}

interface TutorialData {
  execution: string[];
  mistakes: string[];
  tips: string;
}

const PreviousVal: React.FC<{ val: string, label: string }> = ({ val, label }) => (
  <div className="absolute -top-5 left-0 right-0 flex justify-center opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
    <span className="text-[10px] font-mono text-navy-400 bg-offwhite-100 px-1.5 rounded border border-navy-100 whitespace-nowrap">
      Prev: <span className="font-bold text-navy-600">{val || '0'}</span>
    </span>
  </div>
);

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  lastLog, 
  onSave, 
  onRemove,
  isReordering, 
  isFirst, 
  isLast, 
  onMoveUp, 
  onMoveDown 
}) => {
  const [mode, setMode] = useState<'standard' | 'dynamic'>('standard');
  const [sets, setSets] = useState<SetData[]>([{ reps: '', kg: '' }]);
  const [standardInput, setStandardInput] = useState({ sets: '', reps: '', kg: '' });
  const [note, setNote] = useState('');
  
  // Custom Name State (for alternatives)
  const [customName, setCustomName] = useState('');
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);

  // AI Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialData, setTutorialData] = useState<TutorialData | null>(null);
  const [isTutorialLoading, setIsTutorialLoading] = useState(false);

  // Delete Confirmation State
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (lastLog?.mode) {
      setMode(lastLog.mode);
    }
  }, [lastLog]);

  // Pre-fill search query when toggling search on
  useEffect(() => {
    if (showSearch && !searchQuery) {
      setSearchQuery(`Alternativa a ${exercise.name}`);
    }
  }, [showSearch, exercise.name, searchQuery]);

  // Reset delete state after 3 seconds if not confirmed
  useEffect(() => {
    if (isDeleting) {
      const timer = setTimeout(() => setIsDeleting(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDeleting]);

  const handleSetChange = (index: number, field: keyof SetData, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet = lastSet ? { ...lastSet } : { reps: '', kg: '' };
    setSets([...sets, newSet]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const handleSave = () => {
    const newEntry: LogEntry = {
      date: new Date().toLocaleDateString('it-IT'),
      timestamp: Date.now(),
      mode: mode,
      note: note.trim() || undefined,
    };

    if (mode === 'dynamic') {
      const validSets = sets.filter(s => s.reps && s.kg);
      if (validSets.length === 0) {
        alert("Inserisci almeno una serie valida.");
        return;
      }
      newEntry.dynamicSets = validSets;
    } else {
      if (!standardInput.sets || !standardInput.reps || !standardInput.kg) {
        alert("Inserisci Serie, Ripetizioni e Carico per salvare.");
        return;
      }
      newEntry.sets = standardInput.sets;
      newEntry.reps = standardInput.reps;
      newEntry.kg = standardInput.kg;
    }

    onSave(newEntry);
  };

  const handleFetchTutorial = async () => {
    if (tutorialData) {
      setShowTutorial(!showTutorial);
      setShowSearch(false);
      return;
    }

    if (!process.env.API_KEY) {
      setAiError("API Key non trovata.");
      return;
    }

    setShowTutorial(true);
    setShowSearch(false);
    setIsTutorialLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Spiega dettagliatamente come eseguire correttamente l'esercizio "${exercise.name}". 
      Focalizzati sulla biomeccanica corretta.
      IMPORTANTE: Usa il termine anatomico "ischiocrurali" invece di "tendini del ginocchio".
      Rispondi in formato JSON con questa struttura:
      {
        "execution": ["Passo 1...", "Passo 2...", ...],
        "mistakes": ["Errore 1...", "Errore 2...", ...],
        "tips": "Un consiglio tecnico avanzato."
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              execution: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista sequenziale dei passi per l'esecuzione" 
              },
              mistakes: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista errori comuni da evitare" 
              },
              tips: { 
                type: Type.STRING, 
                description: "Un consiglio 'pro' per l'esecuzione" 
              }
            },
            required: ["execution", "mistakes", "tips"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setTutorialData(data);
      }
    } catch (err) {
      console.error(err);
      alert("Errore nel caricamento del tutorial.");
    } finally {
      setIsTutorialLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!process.env.API_KEY) {
      setAiError("API Key non trovata.");
      return;
    }
    
    setIsAiLoading(true);
    setAiError('');
    setAlternatives([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Suggerisci 3 esercizi alternativi a "${exercise.name}" (Gruppo muscolare: ${exercise.muscle}, Funzione: ${exercise.function || 'N/A'}). 
      IMPORTANTE: Usa il termine anatomico "ischiocrurali" invece di "tendini del ginocchio".
      Il termine di ricerca dell'utente è: "${searchQuery}".
      Fornisci una risposta concisa e utile.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Nome dell'esercizio alternativo" },
                reason: { type: Type.STRING, description: "Breve spiegazione del perché è una buona alternativa (max 15 parole)" }
              },
              required: ["name", "reason"]
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setAlternatives(data);
      } else {
        setAiError("Nessuna risposta dall'AI.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Errore durante la ricerca. Riprova.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelectAlternative = (alt: Alternative) => {
    setCustomName(alt.name);
    setNote(prev => {
      const prefix = prev ? prev + '\n' : '';
      return `${prefix}[Swap: ${alt.name}]`;
    });
    setShowSearch(false);
  };

  const handleRevertToOriginal = () => {
    setNote(prev => prev.replace(new RegExp(`\\[Swap: ${customName}\\]`), '').trim());
    setCustomName('');
    setShowTitleDropdown(false);
  };

  const getPlaceholder = (field: 'reps' | 'kg' | 'sets', index: number = 0) => {
    if (!lastLog) return "0";

    if (lastLog.mode === 'dynamic' && lastLog.dynamicSets) {
      if (field === 'sets') return lastLog.dynamicSets.length.toString();
      const set = lastLog.dynamicSets[index];
      return set ? (set[field as 'reps' | 'kg'] || "0") : "0";
    } 
    
    if (lastLog.mode === 'standard') {
       if (field === 'sets') return lastLog.sets || "0";
       return lastLog[field as 'reps' | 'kg'] || "0";
    }

    return "0";
  };

  const isDynamic = mode === 'dynamic';
  const isLoggedToday = lastLog?.date === new Date().toLocaleDateString('it-IT');

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-navy-100 overflow-visible transition-all duration-300 relative ${isReordering ? 'ring-2 ring-coral-400 scale-[1.01] shadow-lg' : 'hover:shadow-md'}`}>
      
      {/* REORDER OVERLAY */}
      {isReordering && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-between px-6 animate-fadeIn rounded-2xl">
          <div className="flex-1">
             <h3 className="font-bold text-lg text-charcoal-900 leading-tight">
               {customName || exercise.name}
             </h3>
             <span className="text-mint-600 font-medium text-sm">
                {exercise.function}
             </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onMoveUp}
              disabled={isFirst}
              className={`p-3 rounded-xl border-2 transition-all ${
                isFirst 
                  ? 'border-navy-100 text-navy-200 cursor-not-allowed' 
                  : 'border-navy-100 bg-white hover:bg-mint-50 hover:border-mint-200 text-navy-600 hover:text-mint-600 shadow-sm active:scale-95'
              }`}
            >
              <ArrowUp size={24} strokeWidth={3} />
            </button>
            <button 
              onClick={onMoveDown}
              disabled={isLast}
              className={`p-3 rounded-xl border-2 transition-all ${
                isLast 
                  ? 'border-navy-100 text-navy-200 cursor-not-allowed' 
                  : 'border-navy-100 bg-white hover:bg-mint-50 hover:border-mint-200 text-navy-600 hover:text-mint-600 shadow-sm active:scale-95'
              }`}
            >
              <ArrowDown size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Exercise Title & Header Controls */}
      <div className="p-4 border-b border-navy-50 bg-offwhite-50 flex justify-between items-start gap-2 relative z-20">
        <div className="flex-1 pr-2 relative">
          
          <div 
            onClick={() => customName && setShowTitleDropdown(!showTitleDropdown)}
            className={`transition-all rounded-lg -ml-2 p-2 ${customName ? 'cursor-pointer hover:bg-navy-100/50 group' : ''}`}
          >
            <h3 className="font-bold text-lg text-charcoal-900 leading-tight flex items-center gap-2">
              {customName || exercise.name}
              {customName && (
                 <ChevronDown size={18} className={`text-navy-400 transition-transform duration-200 ${showTitleDropdown ? 'rotate-180' : ''}`} />
              )}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
               {exercise.function && (
                <span className="text-mint-500 font-medium text-sm">
                  {exercise.function}
                </span>
               )}
               {customName && (
                  <span className="text-[10px] bg-coral-100 text-coral-700 font-bold px-1.5 py-0.5 rounded">
                    AI ALTERNATIVE
                  </span>
               )}
            </div>
          </div>

          {/* DROPDOWN MENU */}
          {showTitleDropdown && customName && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-navy-100 p-1 z-50 animate-fadeIn">
               <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider px-3 py-2">Seleziona Esercizio</div>
               
               <button 
                 onClick={handleRevertToOriginal}
                 className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-navy-50 flex items-center justify-between group transition-colors"
               >
                 <div>
                   <div className="font-bold text-charcoal-800 text-sm">{exercise.name}</div>
                   <div className="text-[10px] text-navy-400">Originale</div>
                 </div>
                 <RefreshCcw size={14} className="text-navy-300 group-hover:text-mint-500" />
               </button>

               <button 
                 onClick={() => setShowTitleDropdown(false)}
                 className="w-full text-left px-3 py-2.5 rounded-lg bg-coral-50 flex items-center justify-between border border-coral-100 mt-1"
               >
                 <div>
                   <div className="font-bold text-coral-900 text-sm">{customName}</div>
                   <div className="text-[10px] text-coral-500">Selezionato</div>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-coral-500"></div>
               </button>
            </div>
          )}

          {!showTitleDropdown && (
            <span className="text-[10px] font-bold text-navy-500 uppercase tracking-wide bg-navy-100 px-2 py-1 rounded mt-2 inline-flex items-center gap-1">
              <Dumbbell size={10} /> {exercise.muscle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          
          {/* TUTORIAL BUTTON */}
          <button
            onClick={handleFetchTutorial}
            disabled={isTutorialLoading}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              showTutorial 
                ? 'bg-coral-100 text-coral-600 ring-2 ring-coral-200' 
                : 'bg-white border border-navy-100 text-coral-500 hover:bg-coral-50 hover:border-coral-200'
            }`}
            title="Come eseguire"
          >
            {isTutorialLoading ? <Loader2 size={16} className="animate-spin text-coral-500" /> : <CircleHelp size={18} strokeWidth={2.5} />}
          </button>

          {/* SEARCH BUTTON */}
          <button
            onClick={() => { setShowSearch(!showSearch); setShowTutorial(false); }}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              showSearch 
                ? 'bg-navy-200 text-navy-700 ring-2 ring-navy-300' 
                : 'bg-white border border-navy-100 text-navy-400 hover:text-navy-600 hover:border-navy-300'
            }`}
            title="Trova alternative"
          >
            <Sparkles size={16} />
          </button>

          {/* MODE TOGGLE */}
          <button 
            onClick={() => setMode(prev => prev === 'dynamic' ? 'standard' : 'dynamic')}
            className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${
              isDynamic 
                ? 'bg-mint-100 text-mint-700 border border-mint-200' 
                : 'bg-offwhite-100 text-navy-500 border border-navy-100'
            }`}
          >
            {isDynamic ? <Layers size={14}/> : <AlignJustify size={14}/>}
            <span className="hidden sm:inline">{isDynamic ? "Serie Singole" : "Standard"}</span>
          </button>
        </div>
      </div>

      {/* TUTORIAL PANEL */}
      {showTutorial && (
        <div className="px-5 py-5 bg-coral-50/40 border-b border-coral-100 animate-fadeIn relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-xs uppercase font-bold text-coral-600 tracking-wider">Guida Esecuzione</h4>
            <div className="h-px flex-1 bg-coral-200/50"></div>
          </div>

          {tutorialData ? (
            <div className="space-y-4">
              {/* Execution Steps */}
              <div>
                 <div className="space-y-2">
                  {tutorialData.execution.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-charcoal-800">
                      <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-coral-200 text-[10px] font-bold text-coral-600 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                 </div>
              </div>

              {/* Mistakes */}
              <div className="bg-white rounded-xl p-3 border border-coral-200 shadow-sm">
                 <h5 className="flex items-center gap-1.5 text-[10px] font-bold text-coral-500 uppercase mb-2">
                   <AlertTriangle size={12} /> Errori Comuni
                 </h5>
                 <ul className="space-y-1.5">
                   {tutorialData.mistakes.map((mistake, idx) => (
                     <li key={idx} className="text-xs text-charcoal-700 flex items-start gap-2">
                       <span className="text-coral-400 mt-0.5">•</span>
                       {mistake}
                     </li>
                   ))}
                 </ul>
              </div>

              {/* Pro Tip */}
              <div className="bg-gradient-to-r from-mint-50 to-navy-50 rounded-xl p-3 border border-mint-100 flex gap-3 items-start">
                 <div className="bg-white p-1.5 rounded-full shadow-sm text-mint-500 mt-0.5">
                    <Sparkles size={12} fill="currentColor" />
                 </div>
                 <div>
                    <h5 className="text-[10px] font-bold text-mint-600 uppercase mb-0.5">Pro Tip</h5>
                    <p className="text-xs text-mint-800 italic">{tutorialData.tips}</p>
                 </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-coral-400 gap-2">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs font-medium">L'AI sta scrivendo la guida...</span>
            </div>
          )}
        </div>
      )}

      {/* AI Search Section */}
      {showSearch && (
        <div className="px-5 py-4 bg-navy-50 border-b border-navy-100 animate-fadeIn relative z-10">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca alternativa..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-navy-200 rounded-lg text-sm text-charcoal-800 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            </div>
            <button
              onClick={handleAiSearch}
              disabled={isAiLoading || !searchQuery}
              className="px-4 py-2 bg-navy-600 hover:bg-navy-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
            >
              {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span className="hidden xs:inline">Cerca</span>
            </button>
          </div>

          {aiError && (
            <p className="text-xs text-coral-500 mb-2 font-medium">{aiError}</p>
          )}

          {alternatives.length > 0 && (
            <div className="space-y-2 mt-2">
              <h4 className="text-[10px] uppercase font-bold text-navy-400 tracking-wider mb-2">Suggerimenti AI</h4>
              {alternatives.map((alt, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSelectAlternative(alt)}
                  className="bg-white p-3 rounded-lg border border-navy-100 shadow-sm flex flex-col gap-1 cursor-pointer hover:bg-navy-50 hover:border-navy-300 hover:shadow-md active:scale-[0.98] transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-charcoal-800 text-sm group-hover:text-navy-700 transition-colors">{alt.name}</span>
                    <span className="text-[10px] font-bold text-mint-500 opacity-0 group-hover:opacity-100 transition-opacity bg-mint-100 px-1.5 py-0.5 rounded">SELEZIONA</span>
                  </div>
                  <span className="text-xs text-navy-500">{alt.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Section - Z-INDEX 10 to sit above input section */}
      <div className="bg-mint-50 border-b border-mint-100 relative z-10 group/history">
        {lastLog && (
          <>
          <div className="px-5 py-3 flex items-start justify-between">
            <div className="flex flex-col gap-1 z-50">
              <div className="flex items-center gap-2 text-mint-800 text-xs font-bold uppercase tracking-wider min-w-max mt-1">
                <History size={14} />
                <span className="hidden sm:inline">Last Session</span>
              </div>
              
              {isLoggedToday && onRemove && (
                 <button 
                   type="button"
                   onPointerDown={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     if (isDeleting) {
                       onRemove();
                       setIsDeleting(false);
                     } else {
                       setIsDeleting(true);
                     }
                   }}
                   className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded border transition-all mt-1 w-max relative z-[9999] cursor-pointer shadow-sm active:scale-95 ${
                     isDeleting 
                       ? 'bg-coral-600 text-white border-coral-700 animate-pulse ring-2 ring-coral-300' 
                       : 'text-coral-600 hover:text-coral-800 bg-white hover:bg-coral-50 border-coral-200'
                   }`}
                 >
                   <Trash2 size={12} />
                   <span>{isDeleting ? 'Sicuro?' : 'Annulla'}</span>
                 </button>
              )}
            </div>
            
            <div className="text-sm text-right flex-1 ml-4 relative z-0">
              {lastLog.mode === 'dynamic' && lastLog.dynamicSets ? (
                <div className="flex flex-col gap-1 items-end">
                  {lastLog.dynamicSets.map((set, idx) => (
                    <div key={idx} className="font-mono text-mint-900 border-b border-mint-200 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0">
                      <span className="text-[10px] text-mint-500 font-bold mr-2">#{idx + 1}</span>
                      <b>{set.reps}</b> reps @ <b>{set.kg}</b> kg
                    </div>
                  ))}
                  <div className="text-[10px] text-mint-600 opacity-70 mt-1 uppercase tracking-wide">{lastLog.date}</div>
                </div>
              ) : (
                <>
                  <div className="font-mono font-bold text-mint-700 text-base">
                    {lastLog.sets} x {lastLog.reps} @ {lastLog.kg}kg
                  </div>
                  <div className="text-[10px] text-mint-600 opacity-70 uppercase tracking-wide">{lastLog.date}</div>
                </>
              )}
            </div>
          </div>
          {lastLog.note && (
            <div className="px-5 pb-3 pt-0 animate-fadeIn">
               <div className="text-xs text-mint-800 bg-white/60 border border-mint-200 rounded-lg p-2.5 italic flex gap-2 items-start">
                 <StickyNote size={12} className="shrink-0 mt-0.5 opacity-50"/>
                 <span className="whitespace-pre-wrap">"{lastLog.note}"</span>
               </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Input Form - Z-INDEX 0 to sit below history */}
      <div className="p-5 bg-white relative z-0">
        {isDynamic ? (
          <div className="space-y-6 mb-4">
            <div className="grid grid-cols-10 gap-2 mb-2 text-[10px] font-bold text-navy-400 uppercase tracking-wider text-center">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Reps</div>
              <div className="col-span-4">Kg</div>
              <div className="col-span-1"></div>
            </div>

            {sets.map((set, idx) => (
              <div key={idx} className="grid grid-cols-10 gap-2 items-center animate-fadeIn relative">
                <div className="col-span-1 text-center font-bold text-navy-300 text-sm">{idx + 1}</div>
                <div className="col-span-4 relative pt-1">
                  <PreviousVal val={getPlaceholder('reps', idx)} label="reps" />
                  <input 
                    type="tel" 
                    value={set.reps}
                    placeholder={getPlaceholder('reps', idx)}
                    className="w-full bg-offwhite-50 border border-navy-200 rounded-lg p-2 text-center font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all placeholder:text-navy-200 relative z-10"
                    onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                  />
                </div>
                <div className="col-span-4 relative pt-1">
                   <PreviousVal val={getPlaceholder('kg', idx)} label="kg" />
                  <input 
                    type="number" step="0.5"
                    value={set.kg}
                    placeholder={getPlaceholder('kg', idx)}
                    className="w-full bg-offwhite-50 border border-navy-200 rounded-lg p-2 text-center font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all placeholder:text-navy-200 relative z-10"
                    onChange={(e) => handleSetChange(idx, 'kg', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  {sets.length > 1 && (
                    <button 
                      onClick={() => removeSet(idx)}
                      className="text-navy-300 hover:text-coral-500 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button 
              onClick={addSet}
              className="w-full py-2.5 border-2 border-dashed border-navy-200 rounded-lg text-navy-400 hover:text-mint-600 hover:border-mint-300 hover:bg-mint-50 transition-all flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Plus size={16} /> Add Set
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-4 pt-2">
            <div className="relative">
              <PreviousVal val={getPlaceholder('sets')} label="sets" />
              <label className="block text-[10px] font-bold text-navy-400 mb-1 uppercase tracking-wider">Sets</label>
              <input 
                type="number" 
                placeholder={getPlaceholder('sets')}
                value={standardInput.sets}
                className="w-full bg-offwhite-50 border border-navy-200 rounded-lg p-2.5 text-center font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all placeholder:text-navy-200"
                onChange={(e) => setStandardInput(prev => ({ ...prev, sets: e.target.value }))}
              />
            </div>
            <div className="relative">
               <PreviousVal val={getPlaceholder('reps')} label="reps" />
              <label className="block text-[10px] font-bold text-navy-400 mb-1 uppercase tracking-wider">Reps</label>
              <input 
                type="text" 
                placeholder={getPlaceholder('reps')}
                value={standardInput.reps}
                className="w-full bg-offwhite-50 border border-navy-200 rounded-lg p-2.5 text-center font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all placeholder:text-navy-200"
                onChange={(e) => setStandardInput(prev => ({ ...prev, reps: e.target.value }))}
              />
            </div>
            <div className="relative">
              <PreviousVal val={getPlaceholder('kg')} label="kg" />
              <label className="block text-[10px] font-bold text-navy-400 mb-1 uppercase tracking-wider">Kg</label>
              <input 
                type="number" 
                step="0.5"
                placeholder={getPlaceholder('kg')}
                value={standardInput.kg}
                className="w-full bg-offwhite-50 border border-navy-200 rounded-lg p-2.5 text-center font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all placeholder:text-navy-200"
                onChange={(e) => setStandardInput(prev => ({ ...prev, kg: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div className="mb-4">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-navy-400 mb-2 uppercase tracking-wider">
               <StickyNote size={14} /> Session Notes
            </label>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How did the exercise feel? Any adjustments?"
                className="w-full bg-offwhite-50 border border-navy-200 rounded-lg p-3 text-sm text-charcoal-700 font-medium focus:outline-none focus:ring-2 focus:ring-mint-500 transition-all placeholder:text-navy-300 min-h-[80px] resize-y"
            />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-navy-900/20"
        >
          <Save size={18} />
          <span>Save Session</span>
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;