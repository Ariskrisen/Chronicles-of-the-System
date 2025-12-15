import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeroProfile, Message, Sender, GameState, ThemeType, ApiConfig } from './types';
import { generateHero, continueStory } from './services/geminiService';
import { HeroStatus } from './components/HeroStatus';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { LocationPreview } from './components/LocationPreview';
import { LibraryModal } from './components/LibraryModal';
import { MainMenu } from './components/MainMenu';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'MENU',
    messages: [],
    currentHero: null,
    systemEnergy: 50,
  });
  
  const [loading, setLoading] = useState(false);
  const [lastHeroStatus, setLastHeroStatus] = useState<string>("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Constants
  const ENERGY_COST_MESSAGE = 35;
  const ENERGY_GAIN_OBSERVE = 15;
  const MAX_ENERGY = 100;

  // Load API Config from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('system_api_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        // Don't auto-login, just allow MainMenu to prefill or we can decide to auto-start.
        // For better UX, let's just keep the config ready for the menu.
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const handleStartGame = (config: ApiConfig) => {
    localStorage.setItem('system_api_config', JSON.stringify(config));
    setApiConfig(config);
    initGame(config);
  };

  // Define themes
  const themeStyles: Record<ThemeType, { bg: string, border: string, accent: string, sysMsg: string, mainBg: string }> = {
    dungeon: { bg: 'bg-zinc-900/50', border: 'border-zinc-800', accent: 'text-indigo-400', sysMsg: 'bg-indigo-950/30', mainBg: 'bg-[#09090b]' },
    forest:  { bg: 'bg-slate-900/50', border: 'border-emerald-900', accent: 'text-emerald-400', sysMsg: 'bg-emerald-950/30', mainBg: 'bg-[#020617]' },
    desert:  { bg: 'bg-stone-900/50', border: 'border-amber-900',  accent: 'text-amber-500',   sysMsg: 'bg-amber-950/30',  mainBg: 'bg-[#0c0a09]' },
    winter:  { bg: 'bg-slate-900/50', border: 'border-cyan-900',   accent: 'text-cyan-400',    sysMsg: 'bg-cyan-950/30',   mainBg: 'bg-[#082f49]' },
    swamp:   { bg: 'bg-stone-900/50', border: 'border-lime-900',   accent: 'text-lime-500',    sysMsg: 'bg-lime-950/30',   mainBg: 'bg-[#0f100a]' },
    city:    { bg: 'bg-zinc-900/50',  border: 'border-rose-900',   accent: 'text-rose-400',    sysMsg: 'bg-rose-950/30',   mainBg: 'bg-[#09090b]' },
  };

  const currentTheme = useMemo(() => {
    if (gameState.currentHero?.theme && themeStyles[gameState.currentHero.theme]) {
      return themeStyles[gameState.currentHero.theme];
    }
    return themeStyles.dungeon;
  }, [gameState.currentHero]);

  // Update body background immediately when theme changes
  useEffect(() => {
    if (gameState.status === 'MENU') {
      document.body.style.backgroundColor = '#09090b';
    } else {
      document.body.style.backgroundColor = currentTheme.mainBg.replace('bg-[', '').replace(']', '');
    }
  }, [currentTheme, gameState.status]);

  // Helper to add message
  const addMessage = (sender: Sender, content: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: crypto.randomUUID(),
          sender,
          content,
          timestamp: Date.now()
        }
      ]
    }));
  };

  // Start generation
  const initGame = useCallback(async (config: ApiConfig) => {
    setGameState(prev => ({ ...prev, status: 'SEARCHING', messages: [], currentHero: null, systemEnergy: 50 }));
    setLastHeroStatus("");
    
    try {
      await new Promise(r => setTimeout(r, 2000));
      const hero = await generateHero(config);
      
      setGameState(prev => ({
        ...prev,
        status: 'LOCATION_PREVIEW',
        currentHero: hero
      }));
    } catch (e) {
      console.error(e);
      alert("Ошибка генерации. Проверьте API ключ или настройки прокси.");
      setGameState(prev => ({ ...prev, status: 'MENU' }));
    }
  }, []);

  // Actually start the game after preview
  const startGame = async () => {
    if (!gameState.currentHero || !apiConfig) return;
    
    setGameState(prev => ({ ...prev, status: 'ACTIVE' }));
    setLoading(true);

    try {
      const initialResponse = await continueStory(gameState.currentHero, [], null, apiConfig);
      
      addMessage(Sender.HERO, initialResponse.diaryEntry);
      setLastHeroStatus(initialResponse.statusDescription);
    } catch (e) {
      console.error(e);
      addMessage(Sender.SYSTEM, "Ошибка соединения с носителем...");
    }
    setLoading(false);
  };

  // Shared logic for processing a turn
  const processTurn = async (userText: string | null) => {
    if (!gameState.currentHero || gameState.status !== 'ACTIVE' || !apiConfig) return;

    let newEnergy = gameState.systemEnergy;

    if (userText) {
      if (newEnergy < ENERGY_COST_MESSAGE) return; 
      addMessage(Sender.SYSTEM, userText);
      newEnergy -= ENERGY_COST_MESSAGE;
    } else {
      // Passive observation grants energy
      newEnergy = Math.min(MAX_ENERGY, newEnergy + ENERGY_GAIN_OBSERVE);
    }
    
    setGameState(prev => ({ ...prev, systemEnergy: newEnergy }));
    setLoading(true);

    const currentMessages = [
        ...gameState.messages,
        ...(userText ? [{ id: 'temp', sender: Sender.SYSTEM, content: userText, timestamp: Date.now() }] : [])
    ];

    try {
      const response = await continueStory(gameState.currentHero, currentMessages, userText, apiConfig);
      
      addMessage(Sender.HERO, response.diaryEntry);
      setLastHeroStatus(response.statusDescription);

      if (response.isDead) {
        setGameState(prev => ({ ...prev, status: 'HERO_DEAD' }));
      }
    } catch (e) {
      console.error(e);
      addMessage(Sender.SYSTEM, "Помехи в ментальном канале (API Error)...");
    }
    setLoading(false);
  };

  const handleSendMessage = (text: string) => processTurn(text);
  const handleNextTurn = () => processTurn(null);

  // Restart to searching (reusing same config)
  const handleRestart = () => {
    if (apiConfig) initGame(apiConfig);
  };

  if (gameState.status === 'MENU') {
    const saved = localStorage.getItem('system_api_config');
    const savedConfig = saved ? JSON.parse(saved) : null;
    return <MainMenu onStart={handleStartGame} savedConfig={savedConfig} />;
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden scanline relative transition-colors duration-1000 ${currentTheme.mainBg}`} style={{ backgroundColor: '' }}>
      
      <LibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />

      {/* Loading Overlay */}
      {(gameState.status === 'INITIALIZING' || gameState.status === 'SEARCHING') && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-zinc-400 font-mono gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <div className="text-xl tracking-widest animate-pulse">
            {gameState.status === 'INITIALIZING' ? 'ЗАГРУЗКА ИНТЕРФЕЙСА...' : 'ПОИСК БИОСИГНАЛОВ...'}
          </div>
          <div className="text-xs text-zinc-600 max-w-md text-center">
            Сканирование реальностей. Пожалуйста, подождите.
          </div>
        </div>
      )}

      {/* Location Preview Overlay */}
      {gameState.status === 'LOCATION_PREVIEW' && gameState.currentHero && (
        <LocationPreview hero={gameState.currentHero} onStart={startGame} />
      )}

      {/* Main UI */}
      <HeroStatus 
        hero={gameState.currentHero} 
        lastStatus={lastHeroStatus} 
        isDead={gameState.status === 'HERO_DEAD'}
        themeColor={currentTheme.accent}
        borderColor={currentTheme.border}
        bgColor={currentTheme.bg}
      />

      <MessageList 
        messages={gameState.messages} 
        isTyping={loading} 
      />

      <InputArea 
        onSend={handleSendMessage} 
        onNextTurn={handleNextTurn}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        disabled={loading || gameState.status !== 'ACTIVE'} 
        isDead={gameState.status === 'HERO_DEAD'}
        onRestart={handleRestart}
        systemEnergy={gameState.systemEnergy}
      />
    </div>
  );
};

export default App;