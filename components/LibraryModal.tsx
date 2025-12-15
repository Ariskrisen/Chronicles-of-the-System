import React, { useState } from 'react';
import { X, Book as BookIcon, Map, Skull, Scroll, Apple, ChevronRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl h-[80vh] flex flex-col md:flex-row shadow-2xl rounded-sm overflow-hidden">
        
        {/* Sidebar / Book List */}
        <div className={`w-full md:w-1/3 bg-black/40 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex flex-col gap-2 ${selectedBook ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-zinc-200 flex items-center gap-2">
              <BookIcon className="text-indigo-500" />
              Архив Знаний
            </h2>
            <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-zinc-300">
              <X size={24} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
            {LORE_LIBRARY.map((book) => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`w-full text-left p-4 rounded border transition-all flex items-center gap-3 group
                  ${selectedBook?.id === book.id 
                    ? 'bg-zinc-800 border-zinc-600' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'}`}
              >
                <div className={`${book.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {iconMap[book.icon] || <BookIcon />}
                </div>
                <div className="flex-1">
                  <div className="font-serif font-bold text-zinc-300">{book.title}</div>
                  <div className="text-xs text-zinc-600 font-mono">Доступ разрешен</div>
                </div>
                <ChevronRight size={16} className={`text-zinc-600 ${selectedBook?.id === book.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`w-full md:w-2/3 bg-[#0c0c0c] flex flex-col relative ${!selectedBook ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={() => {
                  if (selectedBook) setSelectedBook(null); // Back to list on mobile
                  else onClose();
              }} 
              className="p-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-full border border-zinc-700 text-zinc-400 transition-colors"
            >
              {selectedBook ? <span className="md:hidden text-xs font-mono mr-2">НАЗАД</span> : null}
              <X size={20} />
            </button>
          </div>

          {selectedBook ? (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                  <div className={selectedBook.color}>{iconMap[selectedBook.icon]}</div>
                  <h1 className="text-3xl font-serif text-zinc-100">{selectedBook.title}</h1>
                </div>
                <div className="prose prose-invert prose-zinc max-w-none font-serif text-lg leading-relaxed text-zinc-400 whitespace-pre-wrap">
                  {selectedBook.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
              <BookIcon size={48} className="mb-4 opacity-20" />
              <p className="font-mono text-sm">Выберите источник данных для чтения</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};