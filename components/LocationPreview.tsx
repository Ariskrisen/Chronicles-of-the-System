import React from 'react';
import { HeroProfile } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';

interface LocationPreviewProps {
  hero: HeroProfile;
  onStart: () => void;
}

export const LocationPreview: React.FC<LocationPreviewProps> = ({ hero, onStart }) => {
  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full space-y-8 text-center">
        
        <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-zinc-500 font-mono text-xs tracking-[0.2em] uppercase border border-zinc-800 px-3 py-1 rounded-full">
                <MapPin size={12} />
                {hero.startCoordinates}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-zinc-100 font-bold capitalize">
                {hero.theme === 'dungeon' ? 'Древние Руины' :
                 hero.theme === 'forest' ? 'Чаща Скорби' :
                 hero.theme === 'desert' ? 'Пепельная Пустошь' :
                 hero.theme === 'winter' ? 'Ледяной Хребет' :
                 hero.theme === 'swamp' ? 'Гнилое Болото' : 'Темный Город'}
            </h1>
        </div>

        <div className="w-16 h-[1px] bg-zinc-800 mx-auto" />

        <p className="text-lg md:text-xl text-zinc-400 font-serif leading-relaxed italic">
          "{hero.locationDescription}"
        </p>

        <div className="w-16 h-[1px] bg-zinc-800 mx-auto" />

        <div className="pt-8">
             <button
                onClick={onStart}
                className="group flex items-center gap-3 mx-auto text-zinc-300 hover:text-white transition-colors px-8 py-3 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900"
            >
                <span className="font-mono text-sm tracking-widest uppercase">Начать синхронизацию</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};