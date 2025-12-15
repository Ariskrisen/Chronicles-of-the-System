import React, { useState } from 'react';
import { X, Book as BookIcon, Map, Skull, Scroll, Apple, ChevronRight, Feather } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LORE_LIBRARY } from '../data/lore';
import { Book } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Map': <Map size={24} />,
  'Skull': <Skull size={24} />,
  'Scroll': <Scroll size={24} />,
  'Apple': <Apple size={24} />,
};

export const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1c1917] border-2 border-[#594a3a] w-full max-w-5xl h-[85vh] flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden relative">
        
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#bfa15f] z-20" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#bfa15f] z-20" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#bfa15f] z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#bfa15f] z-20" />

        {/* Sidebar / Book List */}
        <div className={`w-full md:w-1/3 bg-[#131110] border-b md:border-b-0 md:border-r border-[#44403c] p-0 flex flex-col ${selectedBook ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-[#292524] bg-[#0c0a09]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-title text-[#d4c5b0] flex items-center gap-2">
                <BookIcon className="text-[#bfa15f]" />
                Архив Знаний
              </h2>
              <button onClick={onClose} className="md:hidden text-[#78716c] hover:text-[#a8a29e]">
                <X size={24} />
              </button>
            </div>
            <p className="text-xs text-[#78716c] font-serif italic">Собрание сочинений старого мира</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {LORE_LIBRARY.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`w-full text-left p-4 border transition-all flex items-center gap-4 group relative overflow-hidden
                  ${selectedBook?.id === book.id 
                    ? 'bg-[#292524] border-[#bfa15f] shadow-inner' 
                    : 'bg-[#1c1917] border-[#44403c] hover:border-[#78716c]'}`}
              >
                <div className={`${selectedBook?.id === book.id ? 'text-[#bfa15f]' : 'text-[#78716c]'} transition-colors`}>
                  {iconMap[book.icon] || <BookIcon />}
                </div>
                <div className="flex-1 z-10">
                  <div className={`font-serif text-lg ${selectedBook?.id === book.id ? 'text-[#e7e5e4]' : 'text-[#a8a29e] group-hover:text-[#d6cbb8]'}`}>
                    {book.title}
                  </div>
                </div>
                {selectedBook?.id === book.id && (
                  <Feather size={16} className="text-[#bfa15f] absolute right-2 top-2 opacity-50" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`w-full md:w-2/3 bg-[#161412] flex flex-col relative ${!selectedBook ? 'hidden md:flex' : 'flex'}`}>
           {/* Mobile header for content */}
           <div className="md:hidden absolute top-4 right-4 z-10 flex gap-2">
            <button 
              onClick={() => setSelectedBook(null)}
              className="p-2 bg-[#292524] rounded border border-[#57534e] text-[#a8a29e]"
            >
               <span className="sr-only">Назад</span>
               <ChevronRight className="rotate-180" size={20} />
            </button>
            <button onClick={onClose} className="p-2 bg-[#292524] rounded border border-[#57534e] text-[#a8a29e]">
               <X size={20} />
            </button>
           </div>
           
           <div className="hidden md:block absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 hover:bg-[#292524] rounded text-[#78716c] hover:text-[#d6cbb8] transition-colors">
              <X size={24} />
            </button>
           </div>

          {selectedBook ? (
            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8 border-b border-[#44403c] pb-6">
                  <div className="p-3 bg-[#0c0a09] border border-[#44403c] rounded-full">
                    {React.cloneElement(iconMap[selectedBook.icon] as React.ReactElement, { size: 32, className: "text-[#bfa15f]" })}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-title font-bold text-[#e7e5e4] tracking-wide">{selectedBook.title}</h1>
                </div>
                
                <div className="prose prose-invert prose-p:text-[#d6cbb8] prose-headings:text-[#bfa15f] prose-headings:font-serif prose-strong:text-[#e7e5e4] prose-li:text-[#d6cbb8] max-w-none font-serif text-lg leading-relaxed">
                  <ReactMarkdown>{selectedBook.content}</ReactMarkdown>
                </div>

                <div className="mt-12 flex justify-center opacity-30">
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#bfa15f] to-transparent" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#57534e] p-8 text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMTYxNDEyIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxYzE5MTciLz4KPC9zdmc+')]">
              <BookIcon size={64} className="mb-6 opacity-20" />
              <p className="font-title text-lg tracking-widest uppercase opacity-60">Выберите манускрипт</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};