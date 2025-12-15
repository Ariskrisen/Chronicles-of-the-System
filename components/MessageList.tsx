import React, { useEffect, useRef } from 'react';
import { Message, Sender } from '../types';
import { Terminal, PenTool } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.sender === Sender.SYSTEM ? 'justify-end' : 'justify-start'}`}
          >
            {/* Hero Message */}
            {msg.sender === Sender.HERO && (
              <div className="flex gap-4 max-w-[90%] md:max-w-[80%]">
                 <div className="flex-shrink-0 mt-1">
                    <PenTool size={18} className="text-amber-700/60" />
                 </div>
                 <div className="space-y-1">
                    <div className="text-xs font-mono text-zinc-600 mb-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="font-serif text-lg leading-relaxed text-zinc-300 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                 </div>
              </div>
            )}

            {/* System Message */}
            {msg.sender === Sender.SYSTEM && (
              <div className="flex flex-row-reverse gap-4 max-w-[90%] md:max-w-[80%]">
                 <div className="flex-shrink-0 mt-1">
                    <Terminal size={18} className="text-indigo-500/60" />
                 </div>
                 <div className="space-y-1 text-right">
                    <div className="text-xs font-mono text-indigo-900/60 mb-1">
                      СИСТЕМА &bull; {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="font-mono text-sm md:text-base text-indigo-200 bg-indigo-950/30 border border-indigo-900/30 p-3 rounded-lg rounded-tr-none shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                      {msg.content}
                    </div>
                 </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 max-w-[80%] animate-pulse">
            <div className="flex-shrink-0 mt-1">
               <PenTool size={18} className="text-zinc-700" />
            </div>
            <div className="font-serif text-zinc-600 italic">
              Пишет в дневник...
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};