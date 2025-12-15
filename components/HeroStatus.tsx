import React from 'react';
import { HeroProfile } from '../types';
import { User, Activity } from 'lucide-react';

interface HeroStatusProps {
  hero: HeroProfile | null;
  lastStatus: string;
  isDead: boolean;
  themeColor: string; // Tailwind text color class, e.g. "text-emerald-500"
  borderColor: string; // Tailwind border class
  bgColor: string; // Tailwind bg class
}

export const HeroStatus: React.FC<HeroStatusProps> = ({ hero, lastStatus, isDead, themeColor, borderColor, bgColor }) => {
  if (!hero) return null;

  return (
    <div className={`border-b ${isDead ? 'border-red-900/50 bg-red-950/20' : `${borderColor} ${bgColor}`} p-4 transition-colors duration-1000`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-4xl mx-auto">
        
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full border border-white/5 ${isDead ? 'bg-red-900/20 text-red-500' : `bg-black/20 ${themeColor}`}`}>
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-zinc-100 tracking-wide">
              {hero.name}
            </h2>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
              {hero.archetype}
            </p>
          </div>
        </div>

        {/* Vitals / State */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Personality removed as requested */}

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Activity size={16} className={`${isDead ? 'text-red-600' : `${themeColor} animate-pulse`}`} />
            <span className={`text-sm font-mono uppercase ${isDead ? 'text-red-500 font-bold' : 'text-zinc-300'}`}>
              {isDead ? 'СИГНАЛ ПОТЕРЯН' : lastStatus || 'СТАБИЛЬНО'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};