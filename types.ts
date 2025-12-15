export enum Sender {
  SYSTEM = 'SYSTEM',
  HERO = 'HERO'
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  timestamp: number;
}

export type ThemeType = 'dungeon' | 'forest' | 'desert' | 'winter' | 'swamp' | 'city';

export interface HeroProfile {
  name: string;
  archetype: string; // e.g., "Disgraced Knight", "Lost Scholar"
  personality: string;
  origin: string; // Brief backstory
  theme: ThemeType; // Determines the UI color scheme
  locationDescription: string; // Pre-start info about the location
  startCoordinates: string; // Fluff data
}

export interface GameState {
  status: 'INITIALIZING' | 'SEARCHING' | 'LOCATION_PREVIEW' | 'ACTIVE' | 'HERO_DEAD';
  messages: Message[];
  currentHero: HeroProfile | null;
  systemEnergy: number; // 0-100
}

export interface AIResponse {
  diaryEntry: string;
  isDead: boolean;
  statusDescription: string;
}

export interface Book {
  id: string;
  title: string;
  icon: string; // Lucide icon name placeholder
  content: string;
  color: string;
}