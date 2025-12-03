import React from 'react';
import { Activity, Trash2, BarChart2 } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onToggleStats: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, onToggleStats }) => {
  const handleReset = () => {
    if (window.confirm('Vuoi davvero cancellare tutti i dati salvati? Questa azione è irreversibile.')) {
      onReset();
    }
  };

  return (
    <header className="bg-navy-900 text-white p-6 sticky top-0 z-50 shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-mint-500" />
            <span className="bg-gradient-to-r from-mint-400 to-mint-200 bg-clip-text text-transparent">
              W.O.T.
            </span>
          </h1>
          <p className="text-navy-200 text-sm font-medium">Tracking your fitness goals</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleStats}
            className="p-2 rounded-full hover:bg-navy-800 text-mint-400 hover:text-mint-300 transition-all duration-300 group"
            aria-label="View Stats"
          >
            <BarChart2 size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button 
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-navy-800 text-navy-300 hover:text-coral-400 transition-all duration-300 group"
            aria-label="Reset Data"
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;