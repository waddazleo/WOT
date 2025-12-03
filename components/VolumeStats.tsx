import React, { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { LogsMap, LogEntry } from '../types';
import { EXERCISE_DB } from '../constants';

interface VolumeStatsProps {
  logs: LogsMap;
  onClose: () => void;
}

export const VolumeStats: React.FC<VolumeStatsProps> = ({ logs, onClose }) => {
  
  const stats = useMemo(() => {
    const volume: Record<string, number> = {};

    Object.entries(logs).forEach(([exId, data]) => {
      const entry = data as LogEntry;
      const exercise = EXERCISE_DB.find(e => e.id === exId);
      if (!exercise) return;

      // Calculate sets for this entry
      let setCheck = 0;
      if (entry.mode === 'dynamic' && entry.dynamicSets) {
        setCheck = entry.dynamicSets.filter(s => s.reps && s.kg).length;
      } else if (entry.sets) {
         setCheck = parseInt(entry.sets) || 0;
      }

      // Normalize Muscle Groups - GRANULAR SPLIT
      let group = exercise.muscle;
      const lower = group.toLowerCase();
      const nameLower = exercise.name.toLowerCase();

      // Chest
      if (lower.includes('petto')) {
        group = 'Petto';
      }
      
      // BACK SPLIT: Dorsali vs Upper Back
      else if (
        lower.includes('dorsali') || 
        lower.includes('ampiezza') || 
        lower.includes('lat machine') // Lat machine usually targets lats (dorsali)
      ) {
        group = 'Dorsali';
      }
      else if (
        lower.includes('schiena') || 
        lower.includes('upper') || 
        lower.includes('spessore') || 
        lower.includes('trapezi') || 
        lower.includes('back')
      ) {
        group = 'Upper Back';
      }
      
      // Shoulders
      else if (lower.includes('spalle') || lower.includes('deltoidi')) {
        group = 'Spalle';
      }
      
      // Arms (Split)
      else if (lower.includes('bicipiti')) group = 'Bicipiti';
      else if (lower.includes('tricipiti')) group = 'Tricipiti';
      else if (lower.includes('avambracci') || lower.includes('polso')) group = 'Avambracci';
      
      // LEGS SPLIT
      else if (lower.includes('quadricipiti')) group = 'Quadricipiti';
      
      // RDL / GLUTE PRIORITY
      // If it mentions Glutei OR it's an RDL (Stacchi Rumeni), categorize as Glutei
      else if (lower.includes('glutei') || nameLower.includes('rdl')) {
        group = 'Glutei';
      }
      else if (lower.includes('femorali')) {
        group = 'Femorali';
      }
      
      else if (lower.includes('interno') || lower.includes('aduttori')) group = 'Aduttori';
      else if (lower.includes('polpacci')) group = 'Polpacci';
      
      // Core
      else if (lower.includes('addome')) group = 'Addome';

      volume[group] = (volume[group] || 0) + setCheck;
    });

    return Object.entries(volume).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-navy-100 flex justify-between items-center bg-offwhite-50">
          <div className="flex items-center gap-2 text-charcoal-800">
            <TrendingUp className="text-mint-500" />
            <h3 className="font-bold text-lg">Weekly Volume</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-navy-100 text-navy-300 hover:text-navy-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {stats.length === 0 ? (
            <div className="text-center py-10 text-navy-300">
              <p>Nessun dato registrato.</p>
              <p className="text-xs mt-1">Completa gli allenamenti per vedere le statistiche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.map(([muscle, count]) => (
                <div key={muscle}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-charcoal-700">{muscle}</span>
                    <span className="text-xs font-mono font-bold text-mint-600 bg-mint-50 px-2 py-0.5 rounded-md">
                      {count} sets
                    </span>
                  </div>
                  <div className="h-3 w-full bg-offwhite-100 rounded-full overflow-hidden">
                    {/* Max range set to 20 for specific muscle groups logic */}
                    <div 
                      className="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full"
                      style={{ width: `${Math.min((count / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-offwhite-50 border-t border-navy-100 text-center">
             <p className="text-[10px] text-navy-400 uppercase tracking-wider">
               Sets per Muscle Group (Target ~10-20)
             </p>
        </div>

      </div>
    </div>
  );
};