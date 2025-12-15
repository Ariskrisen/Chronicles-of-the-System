import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { Key, Skull, Play, ShieldAlert, Scroll } from 'lucide-react';

interface MainMenuProps {
  onStart: (config: ApiConfig) => void;
  savedConfig: ApiConfig | null;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, savedConfig }) => {
  const [apiKey, setApiKey] = useState('');
  const [useProxy, setUseProxy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (savedConfig) {
      setApiKey(savedConfig.apiKey);
      setUseProxy(savedConfig.useProxy);
    } else if (process.env.API_KEY) {
      setApiKey(process.env.API_KEY);
    }
  }, [savedConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('Требуется ключ доступа (API Key)');
      return;
    }

    const config: ApiConfig = {
      apiKey: apiKey.trim(),
      useProxy,
    };

    onStart(config);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0a09] text-[#d6cbb8] p-4 font-serif relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,40,30,0.2)_0%,rgba(0,0,0,0.8)_100%)] z-0" />
      
      <div className="relative z-10 w-full max-w-md space-y-10 animate-in fade-in duration-1000 slide-in-from-bottom-5">
        
        {/* Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#594a3a] bg-[#1c1917] mb-2 shadow-[0_0_20px_rgba(191,161,95,0.1)]">
            <Skull className="text-[#bfa15f]" size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-title font-bold text-[#e7e5e4] tracking-tight drop-shadow-md">
            Хроники
            <br/>
            <span className="text-[#bfa15f] text-2xl md:text-3xl tracking-[0.2em] block mt-2">СИСТЕМЫ</span>
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#594a3a] to-transparent mx-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#1c1917] border border-[#44403c] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#bfa15f]" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#bfa15f]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#bfa15f]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#bfa15f]" />

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-[#a8a29e] uppercase flex items-center gap-2 tracking-widest">
                <Key size={12} />
                Ключ Творца (API Key)
              </label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Впишите руну..."
                className="w-full bg-[#0c0a09] border border-[#44403c] text-[#e7e5e4] px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#bfa15f] transition-all placeholder-[#44403c]"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group p-3 border border-[#292524] bg-[#0c0a09]/50 hover:bg-[#292524] transition-colors">
                <div className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${useProxy ? 'bg-[#bfa15f] border-[#bfa15f]' : 'bg-transparent border-[#57534e]'}`}>
                  {useProxy && <div className="w-2 h-2 bg-black" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={useProxy} 
                  onChange={(e) => setUseProxy(e.target.checked)} 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-serif font-bold text-[#d6cbb8] group-hover:text-white transition-colors">
                    Тайный Путь (Proxy)
                  </span>
                  <span className="text-[10px] text-[#78716c] leading-tight mt-1">
                    Использовать если прямой путь закрыт (РФ)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-xs font-serif bg-red-950/20 p-3 border border-red-900/30">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="mt-8 w-full group relative flex items-center justify-center gap-2 bg-[#292524] text-[#d6cbb8] py-4 font-bold font-title text-sm uppercase tracking-widest hover:bg-[#bfa15f] hover:text-[#0c0a09] transition-all duration-500 border border-[#44403c] hover:border-[#bfa15f]"
          >
            <Play size={16} className="fill-current" />
            <span>Войти в мир</span>
          </button>

          <div className="text-center mt-6">
             <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-[#57534e] hover:text-[#bfa15f] underline font-serif"
            >
              Где найти ключ?
            </a>
          </div>

        </form>
      </div>
    </div>
  );
};