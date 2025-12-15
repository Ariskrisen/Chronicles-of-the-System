import React, { useEffect, useRef } from 'react';
import { Message, Sender } from '../types';
import { Sparkles, Feather } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth bg-[#0c0a09]">
      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === Sender.SYSTEM ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label */}
            <div className={`text-[10px] font-serif uppercase tracking-[0.2em] mb-2 px-2 ${msg.sender === Sender.SYSTEM ? 'text-[#bfa15f]' : 'text-[#78716c]'}`}>
               {msg.sender === Sender.SYSTEM ? 'ВОЛЯ НАБЛЮДАТЕЛЯ' : 'ДНЕВНИК ГЕРОЯ'}
            </div>

            {/* Content Box */}
            <div className={`relative max-w-[90%] md:max-w-[85%] p-6 md:p-8 
              ${msg.sender === Sender.SYSTEM 
                ? 'bg-[#1c1917] border border-[#594a3a] text-[#bfa15f] shadow-[0_0_30px_rgba(191,161,95,0.05)]' 
                : 'bg-transparent text-[#d6cbb8] pl-6 border-l-2 border-[#44403c]'}`}
            >
               {msg.sender === Sender.HERO && (
                 <Feather className="absolute -left-[11px] top-6 bg-[#0c0a09] text-[#78716c]" size={20} />
               )}
               {msg.sender === Sender.SYSTEM && (
                 <div className="absolute -top-3 -right-3 text-[#bfa15f] bg-[#0c0a09] rounded-full p-1 border border-[#594a3a]">
                    <Sparkles size={14} />
                 </div>
               )}

               <div className={`font-serif text-lg md:text-xl leading-relaxed whitespace-pre-wrap ${msg.sender === Sender.SYSTEM ? 'font-bold' : 'italic'}`}>
                 {msg.content}
               </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 text-[#57534e] animate-pulse pl-8">
             <Feather size={16} />
             <span className="font-serif italic text-sm">Герой оставляет записи...</span>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};