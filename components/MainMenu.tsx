import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { Key, Globe, Play, ShieldAlert, Server } from 'lucide-react';

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
      setError('Требуется API ключ');
      return;
    }

    const config: ApiConfig = {
      apiKey: apiKey.trim(),
      useProxy,
      // baseUrl is handled dynamically in the service now
    };

    onStart(config);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-zinc-200 p-4 font-serif relative overflow-hidden scanline">
      {/* Atmosphere Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-[#000000] to-[#000000] z-0" />
      
      <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-full bg-zinc-900/50 border border-zinc-800 mb-4">
            <Globe className="text-emerald-500 animate-pulse" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500">
            Chronicles of the System
          </h1>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
            Интерфейс Наблюдателя v1.0
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/60 p-8 rounded-sm backdrop-blur-md shadow-2xl space-y-6">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-2">
                <Key size={14} />
                Gemini API Key
              </label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-black/50 border border-zinc-700 text-zinc-100 px-4 py-3 font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-900/20 transition-all placeholder-zinc-700"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group p-3 border border-zinc-800 rounded bg-black/20 hover:bg-black/40 transition-colors">
                <div className={`mt-0.5 w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-colors ${useProxy ? 'bg-emerald-900/30 border-emerald-500' : 'bg-black/50 border-zinc-700'}`}>
                  {useProxy && <div className="w-2.5 h-2.5 bg-emerald-500" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={useProxy} 
                  onChange={(e) => setUseProxy(e.target.checked)} 
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-zinc-300 group-hover:text-white transition-colors flex items-center gap-2">
                    <Server size={12} />
                    Режим Прокси (Vercel)
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-tight">
                    Маршрутизация через сервер Vercel. Включите, если прямой доступ к Google API заблокирован (например, из РФ).
                  </span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-950/20 p-3 border border-red-900/30">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full group relative flex items-center justify-center gap-2 bg-zinc-100 text-black py-4 font-bold font-mono text-sm uppercase tracking-wider hover:bg-emerald-400 transition-colors duration-300"
          >
            <Play size={16} className="fill-current" />
            <span>Инициализация</span>
            <div className="absolute inset-0 border border-white/0 group-hover:border-emerald-500/50 transition-all" />
          </button>

          <div className="text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-zinc-600 hover:text-zinc-400 underline font-mono"
            >
              Получить ключ в Google AI Studio
            </a>
          </div>

        </form>

        <div className="text-center text-[10px] text-zinc-700 font-mono">
          System Core Online. Waiting for operator.
        </div>
      </div>
    </div>
  );
};