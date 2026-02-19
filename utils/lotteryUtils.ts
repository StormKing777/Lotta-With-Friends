import { Ticket, DrawResult, DrawFrequency } from '../types';
import { GAME_CONFIG } from '../constants';

export const generateRandomTicket = (): { numbers: number[]; special: number } => {
  const config = GAME_CONFIG;
  const numbers = new Set<number>();
  
  while (numbers.size < config.mainBallCount) {
    numbers.add(Math.floor(Math.random() * config.mainBallMax) + 1);
  }
  
  const special = Math.floor(Math.random() * config.specialBallMax) + 1;
  
  return {
    numbers: Array.from(numbers).sort((a, b) => a - b),
    special,
  };
};

export const calculateNextDraw = (lastDrawTime: number, frequency: DrawFrequency): number => {
  const date = new Date(lastDrawTime);
  
  switch (frequency) {
    case 'INSTANT': return Date.now(); // Logic handled separately usually
    case 'EVERY_5_MIN': return date.getTime() + 5 * 60 * 1000;
    case 'EVERY_10_MIN': return date.getTime() + 10 * 60 * 1000;
    case 'EVERY_15_MIN': return date.getTime() + 15 * 60 * 1000;
    case 'EVERY_20_MIN': return date.getTime() + 20 * 60 * 1000;
    case 'EVERY_25_MIN': return date.getTime() + 25 * 60 * 1000;
    case 'EVERY_30_MIN': return date.getTime() + 30 * 60 * 1000;
    
    case 'HOURLY': return date.getTime() + 60 * 60 * 1000;
    case 'EVERY_2_HOURS': return date.getTime() + 2 * 60 * 60 * 1000;
    case 'EVERY_3_HOURS': return date.getTime() + 3 * 60 * 60 * 1000;
    case 'EVERY_4_HOURS': return date.getTime() + 4 * 60 * 60 * 1000;
    
    case 'EVERY_8_HOURS': return date.getTime() + 8 * 60 * 60 * 1000;
    case 'EVERY_12_HOURS': return date.getTime() + 12 * 60 * 60 * 1000;
    
    case 'DAILY': return date.getTime() + 24 * 60 * 60 * 1000;
    
    case 'WEEKLY_1X': return date.getTime() + 7 * 24 * 60 * 60 * 1000;
    case 'WEEKLY_2X': return date.getTime() + 3.5 * 24 * 60 * 60 * 1000; // Approx every 3.5 days
    case 'WEEKLY_3X': return date.getTime() + 2.33 * 24 * 60 * 60 * 1000; // Approx every 2.3 days
    
    default: return date.getTime() + 24 * 60 * 60 * 1000;
  }
};

export const formatFrequency = (freq: DrawFrequency): string => {
  return freq.replace(/_/g, ' ').replace('EVERY', '').toLowerCase();
};

export const checkTicket = (ticket: Ticket, draw: DrawResult, currentPot: number): Ticket => {
  const matchedNumbers = ticket.numbers.filter(n => draw.numbers.includes(n));
  const matchedSpecial = ticket.special === draw.special;
  
  let prize = 0;
  const matchCount = matchedNumbers.length;
  
  if (matchCount === 5 && matchedSpecial) prize = currentPot; 
  else if (matchCount === 5) prize = Math.floor(currentPot * 0.10);
  else if (matchCount === 4 && matchedSpecial) prize = 5000;
  else if (matchCount === 4) prize = 500;
  else if (matchCount === 3 && matchedSpecial) prize = 200;
  else if (matchCount === 3) prize = 50;
  else if (matchCount === 2 && matchedSpecial) prize = 20;
  else if (matchedSpecial) prize = 5;
  
  return {
    ...ticket,
    matchedNumbers,
    matchedSpecial,
    prize,
  };
};

export const formatCurrency = (amount: number) => {
  return `🪙 ${new Intl.NumberFormat('en-US').format(amount)}`;
};

export const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}