import React, { useState } from 'react';
import { Send, Power, Eye, BookOpen, Feather } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string) => void;
  onNextTurn: () => void;
  onOpenLibrary: () => void;
  disabled: boolean;
  isDead: boolean;
  onRestart: () => void;
  systemEnergy: number;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  onNextTurn, 
  onOpenLibrary,
  disabled, 
  isDead, 
  onRestart,
  systemEnergy
}) => {
  const [text, setText] = useState('');

  const MESSAGE_COST = 35;
  const canSendMessage = systemEnergy >= MESSAGE_COST;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled && !isDead && canSendMessage) {
      onSend(text);
      setText('');
    }
  };

  const handleNextTurnClick = () => {
    if (!disabled && !isDead) {
      onNextTurn();
    }
  };

  if (isDead) {
    return (
      <div className="border-t border-red-900/30 bg-red-950/20 p-6 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <p className="text-red-500 font-title tracking-widest text-lg drop-shadow-md">НИТЬ СУДЬБЫ ОБОРВАНА</p>
          <button
            onClick={onRestart}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-serif font-bold text-red-100 transition-all duration-300 bg-red-900/40 border border-red-800 hover:bg-red-800/60 hover:border-red-500"
          >
            <Power size={18} />
            <span>НАЙТИ НОВУЮ ЖЕРТВУ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#44403c] bg-[#1c1917] p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.7)] z-20">
      
      {/* Energy Bar */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center gap-3">
        <div className="text-[10px] font-serif text-[#78716c] uppercase tracking-wider min-w-[60px]">Влияние</div>
        <div className="flex-1 h-2 bg-[#0c0a09] border border-[#292524] p-[1px]">
          <div 
            className={`h-full transition-all duration-700 ${systemEnergy < MESSAGE_COST ? 'bg-red-900' : 'bg-[#bfa15f]'}`} 
            style={{ width: `${systemEnergy}%` }}
          />
        </div>
        <div className={`text-xs font-mono w-8 text-right ${systemEnergy < MESSAGE_COST ? 'text-red-500' : 'text-[#bfa15f]'}`}>
          {systemEnergy}
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-2 md:gap-4">
        {/* Library Button */}
        <button
          onClick={onOpenLibrary}
          disabled={disabled}
          title="Архив"
          className="bg-[#292524] text-[#a8a29e] px-3 md:px-4 py-3 border border-[#44403c] hover:bg-[#44403c] hover:text-[#d6cbb8] hover:border-[#bfa15f] disabled:opacity-50 transition-all"
        >
          <BookOpen size={20} />
        </button>

        {/* Next Turn / Charge Button */}
        <button
          onClick={handleNextTurnClick}
          disabled={disabled}
          title="Наблюдать"
          className="bg-[#292524] text-[#bfa15f] px-4 py-3 border border-[#44403c] hover:bg-[#0c0a09] hover:border-[#bfa15f] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
        >
          <Eye size={20} />
          <span className="hidden md:inline text-xs font-serif font-bold">+15 Сил</span>
        </button>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="flex-1 flex gap-0 relative shadow-inner">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534e]">
            <Feather size={14} />
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || !canSendMessage}
            placeholder={canSendMessage ? "Начертать волю..." : "Недостаточно влияния..."}
            className={`w-full bg-[#0c0a09] text-[#e7e5e4] border-y border-l px-10 py-3 font-serif text-lg focus:outline-none placeholder-[#44403c] disabled:opacity-50 transition-all
              ${canSendMessage 
                ? 'border-[#44403c] focus:border-[#bfa15f]' 
                : 'border-red-900/30 text-red-900 cursor-not-allowed'}`}
          />
          <button
            type="submit"
            disabled={disabled || !text.trim() || !canSendMessage}
            className={`px-6 py-2 border transition-colors ${canSendMessage 
              ? 'bg-[#292524] text-[#bfa15f] border-[#44403c] hover:bg-[#bfa15f] hover:text-black hover:border-[#bfa15f]' 
              : 'bg-[#1c1917] text-[#44403c] border-[#292524] cursor-not-allowed'}`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};