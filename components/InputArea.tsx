import React, { useState } from 'react';
import { Send, Power, Eye, BookOpen } from 'lucide-react';

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
      <div className="border-t border-red-900/30 bg-red-950/10 p-6 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <p className="text-red-500 font-mono tracking-widest text-sm animate-pulse">СВЯЗЬ С НОСИТЕЛЕМ ПОТЕРЯНА</p>
          <button
            onClick={onRestart}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-mono font-bold text-red-100 transition-all duration-300 bg-red-900/40 border border-red-700 hover:bg-red-800/50 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            <Power size={18} />
            <span>ПОИСК НОВОГО НОСИТЕЛЯ</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20">
      
      {/* Energy Bar */}
      <div className="max-w-4xl mx-auto mb-3 flex items-center gap-3">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider min-w-[60px]">Энергия</div>
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${systemEnergy < MESSAGE_COST ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`} 
            style={{ width: `${systemEnergy}%` }}
          />
        </div>
        <div className={`text-xs font-mono w-8 text-right ${systemEnergy < MESSAGE_COST ? 'text-red-500' : 'text-indigo-400'}`}>
          {systemEnergy}%
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-3">
        {/* Library Button */}
        <button
          onClick={onOpenLibrary}
          disabled={disabled}
          title="Архив Знаний"
          className="bg-zinc-800 text-zinc-400 px-3 md:px-4 py-3 border border-zinc-700 hover:bg-zinc-700 hover:text-amber-200 disabled:opacity-50 transition-colors"
        >
          <BookOpen size={20} />
        </button>

        {/* Next Turn / Charge Button */}
        <button
          onClick={handleNextTurnClick}
          disabled={disabled}
          title="Наблюдать (+Энергия)"
          className="bg-zinc-800 text-emerald-500/80 px-4 py-3 border border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Eye size={20} />
          <span className="hidden md:inline text-xs font-mono font-bold">+15%</span>
        </button>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || !canSendMessage}
            placeholder={canSendMessage ? "Отправить ментальный приказ (-35%)..." : "Недостаточно энергии для связи..."}
            className={`w-full bg-black/40 text-indigo-100 border rounded-none px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 placeholder-zinc-600 disabled:opacity-50 transition-all
              ${canSendMessage 
                ? 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-900/50' 
                : 'border-red-900/30 text-red-900 placeholder-red-900/50 cursor-not-allowed'}`}
          />
          <button
            type="submit"
            disabled={disabled || !text.trim() || !canSendMessage}
            className={`px-6 py-2 border transition-colors ${canSendMessage 
              ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white' 
              : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};