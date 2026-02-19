import React, { useState, useEffect } from 'react';
import { Player, Ticket } from '../types';
import { GAME_CONFIG } from '../constants';
import { generateRandomTicket, formatCurrency } from '../utils/lotteryUtils';
import LotteryBall from './LotteryBall';

interface TicketBuilderProps {
  players: Player[];
  onTicketCreate: (ticket: Omit<Ticket, 'id' | 'purchaseDate'>) => void;
  groupPot: number;
  ticketCost: number;
}

const TicketBuilder: React.FC<TicketBuilderProps> = ({ players, onTicketCreate, groupPot, ticketCost }) => {
  const config = GAME_CONFIG;
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedSpecial, setSelectedSpecial] = useState<number | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string>(players[0].id);
  const [mode, setMode] = useState<'MANUAL' | 'QUICK'>('QUICK');

  const selectedPlayer = players.find(p => p.id === selectedOwner);
  const hasFunds = selectedPlayer && selectedPlayer.balance >= ticketCost;

  // Initial Quick Pick on mount if empty
  useEffect(() => {
    if (selectedNumbers.length === 0 && mode === 'QUICK') {
        runQuickPick();
    }
  }, []);

  const handleNumberClick = (num: number) => {
    if (mode !== 'MANUAL') setMode('MANUAL');
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedNumbers.length < config.mainBallCount) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  const handleSpecialClick = (num: number) => {
    if (mode !== 'MANUAL') setMode('MANUAL');
    setSelectedSpecial(num === selectedSpecial ? null : num);
  };

  const runQuickPick = () => {
    const { numbers, special } = generateRandomTicket();
    setSelectedNumbers(numbers);
    setSelectedSpecial(special);
  };

  const handleTabChange = (newMode: 'MANUAL' | 'QUICK') => {
      setMode(newMode);
      if (newMode === 'QUICK') {
          runQuickPick();
      } else {
          // Clear when switching to manual? Maybe better to keep them for editing.
          // Keeping them for now.
      }
  };

  const handleBuy = () => {
    if (!hasFunds) {
        alert("Insufficient tokens! Visit the Token Shop.");
        return;
    }

    if (selectedNumbers.length === config.mainBallCount && selectedSpecial !== null) {
      onTicketCreate({
        ownerId: selectedOwner,
        numbers: selectedNumbers,
        special: selectedSpecial,
      });
      // Regenerate for next ticket if in Quick Mode
      if (mode === 'QUICK') {
          runQuickPick();
      } else {
          setSelectedNumbers([]);
          setSelectedSpecial(null);
      }
    }
  };

  const isValid = selectedNumbers.length === config.mainBallCount && selectedSpecial !== null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Buy Ticket</h2>
          <p className="text-gray-500 text-sm">Pick your lucky numbers for {config.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {players.map(p => (
                <button
                    key={p.id}
                    onClick={() => setSelectedOwner(p.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${selectedOwner === p.id ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                    <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full" />
                    <span className="flex flex-col items-start leading-none">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className={`text-[10px] ${p.balance < ticketCost ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{formatCurrency(p.balance)}</span>
                    </span>
                </button>
            ))}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button onClick={() => handleTabChange('QUICK')} className={`pb-2 px-2 font-medium text-sm ${mode === 'QUICK' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          Quick Pick
        </button>
        <button onClick={() => handleTabChange('MANUAL')} className={`pb-2 px-2 font-medium text-sm ${mode === 'MANUAL' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          Manual Pick
        </button>
      </div>
      
      {/* Quick Pick Action Area */}
      {mode === 'QUICK' && (
          <div className="flex flex-col items-center justify-center py-6 animate-fade-in-down">
               <button 
                  onClick={runQuickPick}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg md:text-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 border-4 border-blue-200 group relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-2.4 2.4 1.7 1.7-2.4 2.4"/><path d="M10 21h4.6L16 19.6 14.6 18.2 16 16.8"/><path d="M18 8h1.2L21 6.8 19.6 5.4 21 4"/><path d="M13 5.4 14.4 4 13 2.6 11.6 4 13 5.4"/><path d="M7 6c0 1.5-1.5 3-1.5 3S4 7.5 4 6c0-1.5 1.5-3 1.5-3S7 4.5 7 6"/><path d="m11 13-1.6 1.6-1.4-1.4L6.4 14.8l-1.6-1.6L3.4 14.6 2 13.2l1.4-1.4L1.8 10.4l1.6-1.6 1.4 1.4 1.4-1.4 1.6 1.6-1.4 1.4L8 13.2l1.4-1.4 1.6 1.6"/></svg>
                  <span className="text-sm md:text-base">Quick Pick</span>
               </button>
               
               <div className="mt-4 text-center max-w-xs">
                   <p className="text-gray-600 font-medium">Let chance decide!</p>
                   <p className="text-gray-500 text-xs mt-1">
                       Generates a random ticket with bouncing balls.
                   </p>
               </div>

               <p className="text-blue-500 mt-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                   <span className="animate-bounce">👇</span> Click to generate
               </p>
          </div>
      )}

      {/* Ticket Preview */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 flex flex-col items-center justify-center gap-4 border border-dashed border-gray-300">
        <div className="flex flex-wrap justify-center gap-3">
            {selectedNumbers.map((n) => (
                <LotteryBall key={n} number={n} type="main" size="md" />
            ))}
            {Array.from({ length: config.mainBallCount - selectedNumbers.length }).map((_, i) => (
                 <div key={`ph-${i}`} className="w-12 h-12 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center text-gray-300">?</div>
            ))}
            <div className="w-px bg-gray-300 mx-2 h-12"></div>
            {selectedSpecial ? (
                <LotteryBall number={selectedSpecial} type="special" size="md" />
            ) : (
                <div className="w-12 h-12 rounded-full border-2 border-blue-200 border-dashed flex items-center justify-center text-blue-200 font-bold">P</div>
            )}
        </div>
      </div>

      {/* Manual Selection Grid */}
      {mode === 'MANUAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 animate-fade-in-up">
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pick {config.mainBallCount} Numbers (1-{config.mainBallMax})</h4>
                <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: config.mainBallMax }).map((_, i) => {
                        const num = i + 1;
                        const isSelected = selectedNumbers.includes(num);
                        const isDisabled = !isSelected && selectedNumbers.length >= config.mainBallCount;
                        return (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num)}
                                disabled={isDisabled}
                                className={`w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all
                                    ${isSelected ? 'bg-blue-600 text-white scale-110 shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                                `}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pick {config.specialBallName} (1-{config.specialBallMax})</h4>
                <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: config.specialBallMax }).map((_, i) => {
                        const num = i + 1;
                        const isSelected = selectedSpecial === num;
                        return (
                            <button
                                key={num}
                                onClick={() => handleSpecialClick(num)}
                                className={`w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all font-bold
                                    ${isSelected ? 'bg-blue-500 text-white scale-110 shadow-md ring-2 ring-blue-200' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}
                                `}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm">
            <span className="text-gray-500">Ticket Cost: </span>
            <span className="font-bold text-blue-700">{formatCurrency(ticketCost)}</span>
        </div>
        
        <button
            onClick={handleBuy}
            disabled={!isValid || !hasFunds}
            className={`
                px-8 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2
                ${isValid && hasFunds
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:-translate-y-0.5' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="m4.5 15.5 15-3"/><path d="m15 11-1 9"/></svg>
            {hasFunds ? 'Buy Ticket' : 'Need Tokens'}
        </button>
      </div>
    </div>
  );
};

export default TicketBuilder;