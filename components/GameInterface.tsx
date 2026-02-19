import React, { useState, useEffect } from 'react';
import { Player, Ticket, DrawResult, Group, UserProfile, Friend } from '../types';
import { GAME_CONFIG, TOKENS_PER_DOLLAR } from '../constants';
import TicketBuilder from './TicketBuilder';
import StatsBoard from './StatsBoard';
import LotteryBall from './LotteryBall';
import PlayerManager from './PlayerManager';
import BankPanel from './BankPanel';
import DrawAnimation from './DrawAnimation';
import { checkTicket, formatCurrency, generateRandomTicket, calculateNextDraw, formatFrequency } from '../utils/lotteryUtils';

interface GameInterfaceProps {
  userProfile: UserProfile;
  group: Group;
  friends: Friend[];
  onUpdateGroup: (updatedGroup: Group) => void;
  onBack: () => void;
}

const CountdownTimer: React.FC<{ targetTime: number, onComplete: () => void }> = ({ targetTime, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = targetTime - now;
            
            if (diff <= 0) {
                clearInterval(interval);
                onComplete();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetTime]);

    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="flex flex-col items-end">
             <span className="text-xs uppercase opacity-75 font-bold tracking-widest text-red-300 animate-pulse">Live Broadcast In</span>
             <div className="font-mono font-black text-2xl text-white leading-none">
                 {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
             </div>
        </div>
    );
};

const GameInterface: React.FC<GameInterfaceProps> = ({ userProfile, group, friends, onUpdateGroup, onBack }) => {
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingResult, setPendingResult] = useState<DrawResult | null>(null);
  
  const isCreator = group.creatorId === userProfile.id;

  // Auto-Draw Logic
  const handleScheduledDraw = () => {
     // Prevent multiple triggers
     if(isDrawing || pendingResult) return;

     if (group.tickets.length > 0) {
         runDraw();
     } else {
         // If time up but no tickets, reschedule silently or with notification
         const nextTime = calculateNextDraw(group.nextDrawTime, group.drawFrequency);
         onUpdateGroup({ ...group, nextDrawTime: nextTime });
         console.log("Scheduled draw skipped: No tickets sold. Rescheduling.");
     }
  };

  // Helper to update specific player
  const updatePlayerInGroup = (updatedPlayer: Player) => {
    const updatedMembers = group.members.map(m => m.id === updatedPlayer.id ? updatedPlayer : m);
    onUpdateGroup({ ...group, members: updatedMembers });
  };

  const handleInvitePlayer = (name: string) => {
    if (!isCreator) return;
    const friend = friends.find(f => f.name === name);
    
    const newPlayer: Player = {
      id: friend ? friend.id : crypto.randomUUID(),
      name,
      avatar: friend ? friend.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      totalWinnings: 0,
      ticketsPurchased: 0,
      balance: 500,
      bankLinked: false,
      isUser: false
    };
    
    if(group.members.find(p => p.name === name)) {
        alert(`${name} is already in the pool!`);
        return;
    }
    onUpdateGroup({ ...group, members: [...group.members, newPlayer] });
  };

  const handleKickPlayer = (id: string) => {
    if (!isCreator) return;
    if (window.confirm("Kick this player? They will be removed from the pool.")) {
        onUpdateGroup({ 
            ...group, 
            members: group.members.filter(p => p.id !== id),
            tickets: group.tickets.filter(t => t.ownerId !== id)
        });
    }
  };

  const handleBuyTokens = (id: string, dollarAmount: number) => {
    const tokens = dollarAmount * TOKENS_PER_DOLLAR;
    const player = group.members.find(p => p.id === id);
    if(player) {
        updatePlayerInGroup({ ...player, balance: player.balance + tokens });
    }
  };

  const handleDonateToPot = (playerId: string, amount: number) => {
    const player = group.members.find(p => p.id === playerId);
    if (!player || player.balance < amount) {
        alert("Not enough tokens to donate!");
        return;
    }
    
    const updatedMembers = group.members.map(p => {
        if (p.id === playerId) return { ...p, balance: p.balance - amount };
        return p;
    });

    onUpdateGroup({
        ...group,
        members: updatedMembers,
        pot: group.pot + amount
    });
  };

  const handleTicketCreate = (newTicketData: Omit<Ticket, 'id' | 'purchaseDate'>) => {
    const cost = group.ticketCost;
    const player = group.members.find(p => p.id === newTicketData.ownerId);
    if (!player || player.balance < cost) {
        alert("Insufficient tokens!");
        return;
    }

    const updatedMembers = group.members.map(p => {
        if (p.id === newTicketData.ownerId) {
            return { 
                ...p, 
                ticketsPurchased: p.ticketsPurchased + 1,
                balance: p.balance - cost 
            };
        }
        return p;
    });

    const newTicket: Ticket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      purchaseDate: Date.now(),
    };

    onUpdateGroup({
        ...group,
        members: updatedMembers,
        pot: group.pot + cost,
        tickets: [...group.tickets, newTicket]
    });
  };

  const runDraw = () => {
    if (group.tickets.length === 0) {
        alert("Buy some tickets first!");
        return;
    }
    const { numbers, special } = generateRandomTicket();
    const resultTemplate: DrawResult = {
        id: crypto.randomUUID(),
        numbers,
        special,
        date: Date.now(),
        totalPayout: 0
    };
    setPendingResult(resultTemplate);
    setIsDrawing(true);
    setDrawResult(null);
  };

  const finalizeDraw = () => {
    if (!pendingResult) return;

    let currentDrawPot = group.pot;
    let totalPayout = 0;
    let updatedMembers = [...group.members];

    const processedTickets = group.tickets.map(t => {
        const checked = checkTicket(t, pendingResult, currentDrawPot);
        if (checked.prize && checked.prize > 0) {
            totalPayout += checked.prize;
            if (checked.prize >= currentDrawPot) {
                currentDrawPot = 10000; // Reset to seed
            }
            updatedMembers = updatedMembers.map(p => {
                if (p.id === checked.ownerId) {
                    return { 
                        ...p, 
                        totalWinnings: p.totalWinnings + (checked.prize || 0),
                        balance: p.balance + (checked.prize || 0)
                    };
                }
                return p;
            });
        }
        return checked;
    });

    const jackpotHit = processedTickets.some(t => (t.prize || 0) >= group.pot);
    const newPot = jackpotHit ? 10000 : group.pot;
    const finalResult = { ...pendingResult, totalPayout };
    
    // Calculate Next Draw Time based on frequency
    let nextDrawTime = group.nextDrawTime;
    if (group.drawFrequency !== 'INSTANT') {
        nextDrawTime = calculateNextDraw(Date.now(), group.drawFrequency);
    }

    setDrawResult(finalResult);
    onUpdateGroup({
        ...group,
        members: updatedMembers,
        tickets: processedTickets,
        pot: newPot,
        history: [finalResult, ...group.history],
        nextDrawTime: nextDrawTime
    });
    setIsDrawing(false);
    setPendingResult(null);
  };

  const resetGame = () => {
    // Archives old tickets (in real app) or just clears for new round
    onUpdateGroup({ ...group, tickets: [] });
    setDrawResult(null);
  };

  if (isDrawing && pendingResult) {
      return (
        <DrawAnimation 
            drawResult={pendingResult} 
            tickets={group.tickets} 
            onComplete={finalizeDraw} 
        />
      );
  }

  return (
    <div className={`min-h-screen ${GAME_CONFIG.colorTheme.bg} pb-20 transition-colors duration-700 font-sans`}>
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors mr-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className={`p-2 rounded-lg bg-blue-600`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight leading-none">{group.name}</h1>
                    <div className="flex items-center gap-2 text-xs text-blue-200 mt-1">
                        <span className="bg-blue-900/50 px-2 py-0.5 rounded border border-blue-500/30 uppercase font-bold">{formatFrequency(group.drawFrequency)}</span>
                        <span>Ticket: {formatCurrency(group.ticketCost)}</span>
                        {isCreator && <span className="bg-blue-500 text-white px-1 rounded text-[9px] uppercase font-bold">Admin</span>}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                {group.drawFrequency !== 'INSTANT' && !drawResult && (
                    <CountdownTimer 
                        targetTime={group.nextDrawTime} 
                        onComplete={handleScheduledDraw} 
                    />
                )}
                
                <div className="flex flex-col items-end text-white">
                    <span className="text-xs uppercase opacity-75 font-bold tracking-widest">Group Pot</span>
                    <span className="text-2xl font-black text-yellow-300 drop-shadow-md">{formatCurrency(group.pot)}</span>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {drawResult ? (
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-fade-in-up">
                <h2 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-widest">Winning Numbers</h2>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {drawResult.numbers.map((n) => (
                        <LotteryBall key={n} number={n} type="main" size="lg" />
                    ))}
                    <LotteryBall number={drawResult.special} type="special" size="lg" />
                </div>
                <div className="text-gray-500 mb-6">
                    Total Prize Payout: <span className="text-2xl font-bold text-green-600">{formatCurrency(drawResult.totalPayout)}</span>
                </div>
                <button 
                    onClick={resetGame}
                    className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition-colors"
                >
                    Start New Round
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <TicketBuilder 
                        players={group.members} 
                        onTicketCreate={handleTicketCreate} 
                        groupPot={group.pot}
                        ticketCost={group.ticketCost}
                    />
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Active Pool ({group.tickets.length})</h3>
                            {group.tickets.length > 0 && !isDrawing && (
                                <button 
                                    onClick={() => runDraw()}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 text-sm"
                                >
                                    Force Draw (Admin)
                                </button>
                            )}
                        </div>

                        {group.tickets.length === 0 ? (
                            <div className="text-center py-12 text-white/40 border-2 border-dashed border-white/10 rounded-lg">
                                Pot grows with every ticket! Buy one above.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.tickets.map((ticket) => {
                                    const player = group.members.find(p => p.id === ticket.ownerId);
                                    return (
                                        <div key={ticket.id} className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <img src={player?.avatar} className="w-6 h-6 rounded-full" alt="avatar"/>
                                                    <span className="text-xs font-bold text-gray-500 uppercase">{player?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {ticket.numbers.map(n => (
                                                        <span key={n} className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center border border-gray-200">{n}</span>
                                                    ))}
                                                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center border border-blue-600">{ticket.special}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-blue-600 font-bold opacity-50">+Pot</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <BankPanel 
                        players={group.members} 
                        groupPot={group.pot}
                        onBuyTokens={handleBuyTokens} 
                        onDonate={handleDonateToPot}
                        onUpdatePlayer={updatePlayerInGroup}
                    />
                    <PlayerManager 
                        players={group.members} 
                        friends={friends}
                        isCreator={isCreator}
                        onAddPlayer={handleInvitePlayer} 
                        onRemovePlayer={handleKickPlayer} 
                    />
                    <StatsBoard players={group.members} />
                    
                    <div className="bg-white/10 rounded-xl p-6 text-white backdrop-blur-sm border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Past Draws</h3>
                        <div className="space-y-3">
                            {group.history.slice(0, 5).map(h => (
                                <div key={h.id} className="text-sm border-b border-white/10 pb-2 last:border-0">
                                    <div className="flex justify-between text-white/60 text-xs mb-1">
                                        <span>{new Date(h.date).toLocaleTimeString()}</span>
                                        <span>Payout: {formatCurrency(h.totalPayout)}</span>
                                    </div>
                                    <div className="flex gap-1 justify-center">
                                        {h.numbers.map(n => <span key={n} className="font-mono text-white">{n}</span>)}
                                        <span className="font-mono text-blue-400 font-bold">{h.special}</span>
                                    </div>
                                </div>
                            ))}
                            {group.history.length === 0 && <p className="text-white/40 text-sm text-center">No history yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default GameInterface;