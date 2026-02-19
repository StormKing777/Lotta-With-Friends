import { GameConfig } from './types';

export const TOKENS_PER_DOLLAR = 100;
export const TICKET_COST_TOKENS = 100; // Simplified to 100 tokens ($1.00)

export const GAME_CONFIG: GameConfig = {
  name: 'Lotto & Friends',
  mainBallCount: 5,
  mainBallMax: 50,     // Easier odds for social play (1-50)
  specialBallMax: 20,  // Easier odds (1-20)
  specialBallName: 'Star Ball',
  colorTheme: {
    main: 'ball-white text-gray-900',
    special: 'ball-blue text-white',
    bg: 'bg-slate-900',
    border: 'border-slate-700',
  },
};

export const MOCK_PLAYERS = [
  { id: '1', name: 'Me', avatar: 'https://picsum.photos/seed/me/50/50', totalWinnings: 0, ticketsPurchased: 0, balance: 2000, bankLinked: false },
  { id: '2', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/50/50', totalWinnings: 0, ticketsPurchased: 0, balance: 2000, bankLinked: true },
  { id: '3', name: 'Bob', avatar: 'https://picsum.photos/seed/bob/50/50', totalWinnings: 0, ticketsPurchased: 0, balance: 2000, bankLinked: false },
];