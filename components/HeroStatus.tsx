import React from 'react';
import { HeroProfile } from '../types';
import { User, Activity, MapPin } from 'lucide-react';

interface HeroStatusProps {
  hero: HeroProfile | null;
  lastStatus: string;
  isDead: boolean;
  themeColor: string; // Tailwind text color class
  borderColor: string; // Tailwind border class
  bgColor: string; // Tailwind bg class
}

export const HeroStatus: React.FC<HeroStatusProps> = ({ hero, lastStatus, isDead, themeColor, borderColor, bgColor }) => {
  if (!hero) return null;

  return (
    <div className={`border-b-2 border-[#44403c] bg-[#1c1917] p-4 shadow-md z-10 relative`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-4xl mx-auto">
        
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 flex items-center justify-center border-2 border-[#594a3a] bg-[#0c0a09] transform rotate-45 overflow-hidden shadow-inner`}>
            <div className={`transform -rotate-45 ${isDead ? 'text-red-800' : 'text-[#bfa15f]'}`}>
               <User size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-title font-bold text-[#e7e5e4] tracking-wide">
              {hero.name}
            </h2>
            <p className="text-xs text-[#a8a29e] font-serif uppercase tracking-widest">
              {hero.archetype}
            </p>
          </div>
        </div>

        {/* Vitals / State */}
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-6 w-full md:w-auto">
          
          <div className="flex items-center gap-2 text-[#78716c]">
             <MapPin size={14} />
             <span className="text-xs font-serif uppercase">{hero.startCoordinates}</span>
          </div>

          <div className="h-8 w-[1px] bg-[#44403c] hidden md:block" />

          <div className="flex items-center gap-2">
            <Activity size={16} className={`${isDead ? 'text-red-900' : 'text-[#bfa15f]'} ${!isDead && 'animate-pulse'}`} />
            <span className={`text-sm font-serif font-bold uppercase ${isDead ? 'text-red-700' : 'text-[#d6cbb8]'}`}>
              {isDead ? 'МЕРТВ' : lastStatus || 'ЖИВОЙ'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};