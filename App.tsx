
import React, { useState, useEffect } from 'react';
import { Dumbbell, CalendarOff, ArrowUpDown, Check, Flame } from 'lucide-react';

import Header from './components/Header';
import DaySelector from './components/DaySelector';
import ExerciseCard from './components/ExerciseCard';
import { VolumeStats } from './components/VolumeStats';
import WarmupModal from './components/WarmupModal';
import { WEEK_DAYS, EXERCISE_DB } from './constants';
import { LogsMap, LogEntry } from './types';
import { getStoredLogs, saveStoredLogs, clearStoredLogs, getStoredOrder, saveStoredOrder } from './services/storageService';

const App: React.FC = () => {
  const [activeDay, setActiveDay] = useState<string>('lun');
  const [logs, setLogs] = useState<LogsMap>({});
  const [exerciseOrderMap, setExerciseOrderMap] = useState<Record<string, string[]>>({});
  const [isClient, setIsClient] = useState(false);
  
  // Reordering State
  const [isReordering, setIsReordering] = useState(false);
  
  // Stats State
  const [showStats, setShowStats] = useState(false);

  // Warmup State
  const [showWarmup, setShowWarmup] = useState(false);

  // Initialize
  useEffect(() => {
    setIsClient(true);
    setLogs(getStoredLogs());
    setExerciseOrderMap(getStoredOrder());
    
    // Set current day
    const todayIndex = new Date().getDay(); 
    // JS getDay(): 0=Sun, 1=Mon... 6=Sat
    const dayMap = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
    setActiveDay(dayMap[todayIndex]);
  }, []);

  // Persistence for Logs
  useEffect(() => {
    if (Object.keys(logs).length > 0) {
      saveStoredLogs(logs);
    }
  }, [logs]);

  // Persistence for Order
  useEffect(() => {
    if (Object.keys(exerciseOrderMap).length > 0) {
      saveStoredOrder(exerciseOrderMap);
    }
  }, [exerciseOrderMap]);

  const handleSaveLog = (exerciseId: string, entry: LogEntry) => {
    setLogs(prev => {
      const newLogs = {
        ...prev,
        [exerciseId]: entry
      };
      saveStoredLogs(newLogs);
      return newLogs;
    });
  };

  const handleRemoveLog = (exerciseId: string) => {
    // Confirmation is now handled in the ExerciseCard component to prevent double-confirm bugs
    setLogs(prev => {
      const newLogs = { ...prev };
      delete newLogs[exerciseId];
      saveStoredLogs(newLogs);
      return newLogs;
    });
  };

  const handleReset = () => {
    clearStoredLogs();
    setLogs({});
    setExerciseOrderMap({});
    window.location.reload();
  };

  const getExercisesForDay = (dayId: string) => {
    const dayExercises = EXERCISE_DB.filter(ex => ex.day === dayId);
    const customOrder = exerciseOrderMap[dayId];

    if (!customOrder || customOrder.length === 0) {
      return dayExercises;
    }

    // Sort according to custom order
    const orderMap = new Map<string, number>();
    customOrder.forEach((id, index) => orderMap.set(id, index));
    
    return [...dayExercises].sort((a, b) => {
      const indexA = orderMap.get(a.id);
      const indexB = orderMap.get(b.id);

      if (indexA !== undefined && indexB !== undefined) return indexA - indexB;
      if (indexA !== undefined) return -1;
      if (indexB !== undefined) return 1;
      return 0;
    });
  };

  const moveExercise = (currentIndex: number, direction: 'up' | 'down') => {
    const currentExercises = getExercisesForDay(activeDay);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= currentExercises.length) return;

    // Create a new order array based on IDs
    const newOrder = currentExercises.map(ex => ex.id);
    
    // Swap
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    setExerciseOrderMap(prev => ({
      ...prev,
      [activeDay]: newOrder
    }));
  };

  const activeDayInfo = WEEK_DAYS.find(d => d.id === activeDay) || WEEK_DAYS[0];
  const isRestDay = activeDay === 'mer' || activeDay === 'dom';
  const currentExercises = getExercisesForDay(activeDay);
  
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-offwhite-50 text-charcoal-900 font-sans pb-24">
      <Header onReset={handleReset} onToggleStats={() => setShowStats(true)} />

      {showStats && (
        <VolumeStats logs={logs} onClose={() => setShowStats(false)} />
      )}

      {showWarmup && (
        <WarmupModal 
          dayInfo={activeDayInfo} 
          exercises={currentExercises} 
          onClose={() => setShowWarmup(false)} 
        />
      )}

      <DaySelector 
        days={WEEK_DAYS} 
        activeDay={activeDay} 
        onSelectDay={(day) => { setActiveDay(day); setIsReordering(false); }} 
      />

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Day Header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-navy-100 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-charcoal-800 tracking-tight">{activeDayInfo.full}</h2>
            <div className="flex items-center gap-2 text-mint-600 font-medium mt-1 text-sm uppercase tracking-wide">
              <Dumbbell size={16} />
              <span>{activeDayInfo.focus}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full xs:w-auto">
             
             {/* Warmup Button - The "Flame Rectangle" */}
             {!isRestDay && (
               <button
                 onClick={() => setShowWarmup(true)}
                 className="flex-1 xs:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-coral-50 text-coral-600 border border-coral-200 hover:bg-coral-100 hover:border-coral-300 shadow-sm transition-all active:scale-95 group"
                 title="Smart Warm-up"
               >
                 <Flame size={18} className="fill-coral-500 text-coral-500 animate-pulse" />
                 <span>Riscaldamento</span>
               </button>
             )}

             {/* Reorder Toggle Button */}
             {!isRestDay && (
               <button
                 onClick={() => setIsReordering(!isReordering)}
                 className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                   isReordering 
                    ? 'bg-navy-800 text-white border-navy-900' 
                    : 'bg-white text-navy-500 border-navy-200 hover:bg-offwhite-100'
                 }`}
               >
                 {isReordering ? <Check size={18} /> : <ArrowUpDown size={18} />}
               </button>
             )}
          </div>
        </div>

        {/* Content Area */}
        {isRestDay ? (
          <div className="text-center py-24 px-6 bg-white rounded-2xl shadow-sm border border-dashed border-navy-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-offwhite-100 rounded-full mb-6 text-navy-300">
               <CalendarOff size={40} />
            </div>
            <h3 className="text-xl font-bold text-charcoal-800">Rest Day</h3>
            <p className="text-navy-400 mt-2 max-w-sm mx-auto">
              Take time to recover. Focus on stretching, mobility, or just enjoy the relaxation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentExercises.map((ex, index) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                lastLog={logs[ex.id]}
                onSave={(log) => handleSaveLog(ex.id, log)}
                onRemove={() => handleRemoveLog(ex.id)}
                
                // Reordering Props
                isReordering={isReordering}
                isFirst={index === 0}
                isLast={index === currentExercises.length - 1}
                onMoveUp={() => moveExercise(index, 'up')}
                onMoveDown={() => moveExercise(index, 'down')}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
