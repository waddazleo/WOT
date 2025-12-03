import React from 'react';
import { WeekDay } from '../types';

interface DaySelectorProps {
  days: WeekDay[];
  activeDay: string;
  onSelectDay: (dayId: string) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ days, activeDay, onSelectDay }) => {
  return (
    <div className="bg-white border-b border-navy-100 overflow-x-auto sticky top-[88px] z-40 shadow-sm scrollbar-hide">
      <div className="flex max-w-3xl mx-auto p-2 gap-2 min-w-max">
        {days.map(day => {
          const isActive = activeDay === day.id;
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[60px] transition-all duration-300 ${
                isActive 
                  ? 'bg-mint-500 text-white shadow-md transform scale-105 ring-2 ring-mint-200' 
                  : 'bg-offwhite-50 text-navy-400 hover:bg-offwhite-100'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{day.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelector;