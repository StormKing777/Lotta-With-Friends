export type DrawFrequency = 
  | 'INSTANT' 
  | 'EVERY_5_MIN' | 'EVERY_10_MIN' | 'EVERY_15_MIN' | 'EVERY_20_MIN' | 'EVERY_25_MIN' | 'EVERY_30_MIN'
  | 'HOURLY' | 'EVERY_2_HOURS' | 'EVERY_3_HOURS' | 'EVERY_4_HOURS'
  | 'EVERY_8_HOURS' | 'EVERY_12_HOURS'
  | 'DAILY' 
  | 'WEEKLY_1X' | 'WEEKLY_2X' | 'WEEKLY_3X';

export interface UserProfile {
  id: string;
  legalName: string;
  email: string;
  dateOfBirth: string;
  ssnLast4: string;
  address: string;
  isVerified: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  totalWinnings: number;
  ticketsPurchased: number;
  balance: number;
  bankLinked?: boolean;
  isUser?: boolean; // Flag to identify the real user vs bots
}

export interface Friend {
    id: string;
    name: string;
    avatar: string;
    status: 'ONLINE' | 'OFFLINE';
}

export interface Ticket {
  id: string;
  ownerId: string;
  numbers: number[];
  special: number;
  purchaseDate: number;
  matchedNumbers?: number[];
  matchedSpecial?: boolean;
  prize?: number;
}

export interface DrawResult {
  id: string;
  numbers: number[];
  special: number;
  date: number;
  totalPayout: number;
}

export interface Group {
  id: string;
  creatorId: string; // ID of the user who owns the group
  name: string;
  description: string;
  pot: number;
  ticketCost: number; // "Pot Rate" - cost per ticket
  drawFrequency: DrawFrequency;
  nextDrawTime: number; // Timestamp for the next scheduled live draw
  members: Player[];
  tickets: Ticket[];
  history: DrawResult[];
  createdDate: number;
}

export interface GameConfig {
  name: string;
  mainBallCount: number;
  mainBallMax: number;
  specialBallMax: number;
  specialBallName: string;
  colorTheme: {
    main: string;
    special: string;
    bg: string;
    border: string;
  };
}

export interface BankAccount {
  routingNumber: string;
  accountNumber: string;
  holderName: string;
}

export interface GeminiOracleResponse {
  numbers: number[];
  special: number;
  reasoning: string;
}