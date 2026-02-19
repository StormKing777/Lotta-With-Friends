import React, { useState, useEffect } from 'react';
import { DrawResult, Ticket } from '../types';
import LotteryBall from './LotteryBall';

interface DrawAnimationProps {
  drawResult: DrawResult;
  tickets: Ticket[];
  onComplete: () => void;
}

const DrawAnimation: React.FC<DrawAnimationProps> = ({ drawResult, tickets, onComplete }) => {
  const [step, setStep] = useState(0); 
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);
  const [isSpecialRevealed, setIsSpecialRevealed] = useState(false);
  const [hostMessage, setHostMessage] = useState("Welcome to Lotto & Friends! Let's play!");

  // Statistics State
  const [jackpotContenders, setJackpotContenders] = useState<number>(tickets.length);
  const [currentMatchCount, setCurrentMatchCount] = useState<number>(0);

  const totalSteps = drawResult.numbers.length + 1; // Main balls + Special

  useEffect(() => {
    let currentStep = 0;
    
    // Initial delay for intro
    const initialDelay = setTimeout(() => {
        setHostMessage("Mixing up the lucky numbers...");
        
        const interval = setInterval(() => {
        currentStep++;
        setStep(currentStep);

        // Animation Logic
        if (currentStep <= drawResult.numbers.length) {
            // Main Ball Revealed
            const newRevealed = drawResult.numbers.slice(0, currentStep);
            setRevealedNumbers(newRevealed);
            const currentBall = drawResult.numbers[currentStep - 1];
            
            setHostMessage(`And number ${currentStep} is... ${currentBall}!`);

            // Stats
            const matchers = tickets.filter(t => t.numbers.includes(currentBall)).length;
            setCurrentMatchCount(matchers);

            const contenders = tickets.filter(t => 
                newRevealed.every(num => t.numbers.includes(num))
            ).length;
            setJackpotContenders(contenders);

        } else if (currentStep === totalSteps) {
            // Special Ball Revealed
            setIsSpecialRevealed(true);
            const specialBall = drawResult.special;
            setHostMessage(`Time for the Star Ball! It's ${specialBall}!`);
            
            const contenders = tickets.filter(t => 
                drawResult.numbers.every(num => t.numbers.includes(num)) && t.special === specialBall
            ).length;
            setJackpotContenders(contenders);
        } else {
            // Finish
            setHostMessage("Congratulations to all the winners!");
            clearInterval(interval);
            setTimeout(onComplete, 3000); 
        }

        }, 3000); // 3 seconds per ball for dramatic effect

        return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(initialDelay);
  }, []);

  const activeNumber = step > 0 && step <= drawResult.numbers.length ? drawResult.numbers[step - 1] : null;
  const activeSpecial = step === totalSteps ? drawResult.special : null;

  // Render dummy bouncing balls
  const renderBouncingBalls = (count: number, colorClass: string) => {
      return Array.from({ length: count }).map((_, i) => {
          const delay = Math.random() * 2;
          const duration = 0.5 + Math.random();
          const left = Math.random() * 70 + 10;
          const top = Math.random() * 70 + 10;
          
          return (
              <div 
                key={i} 
                className={`absolute w-6 h-6 rounded-full ${colorClass} shadow-inner`}
                style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animation: `bounce-chaos ${duration}s infinite alternate ease-in-out -${delay}s`
                }}
              >
                 <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-40"></div>
              </div>
          );
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center overflow-hidden font-sans">
        
        {/* Studio Background & Lights */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black z-0">
            <div className="absolute top-0 left-1/4 w-32 h-full bg-white opacity-5 blur-2xl transform -skew-x-12 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-32 h-full bg-white opacity-5 blur-2xl transform skew-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
            {/* Floor Grid */}
            <div className="absolute bottom-0 w-full h-1/3 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px] [perspective:1000px] [transform:rotateX(60deg)_scale(2)] opacity-20"></div>
        </div>

        {/* 3D Title Sign */}
        <div className="relative z-10 mt-8 mb-4">
            <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tighter transform -rotate-2">
                Lotto & Friends
            </div>
            <div className="absolute inset-0 text-4xl md:text-6xl font-black text-yellow-900 blur-sm transform translate-y-2 -rotate-2 -z-10">
                Lotto & Friends
            </div>
        </div>

        {/* Studio Stage */}
        <div className="relative z-10 w-full max-w-6xl flex-1 flex flex-col md:flex-row items-end justify-center pb-32 px-4 gap-8">
            
            {/* Host Section */}
            <div className="relative w-1/3 md:w-1/4 flex flex-col items-center z-20">
                {/* Speech Bubble */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl p-4 shadow-xl border-b-4 border-gray-200 animate-bounce-subtle">
                    <p className="text-gray-800 font-bold text-center text-lg leading-tight">{hostMessage}</p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-b-4 border-r-4 border-gray-200"></div>
                </div>
                
                {/* Cartoon Host Avatar */}
                <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=LottoHost&clothing=blazerAndShirt&eyes=happy&mouth=smile&skin=light" 
                    alt="Host" 
                    className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl hover:scale-105 transition-transform"
                />
            </div>

            {/* Machines Section */}
            <div className="flex-1 flex justify-center items-end gap-8 pb-4">
                
                {/* Main Machine */}
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-gray-300 bg-white/10 backdrop-blur-sm shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden group">
                    {/* Bouncing Balls inside machine */}
                    <div className="absolute inset-0">
                        {renderBouncingBalls(15, 'bg-gray-100')}
                    </div>
                    {/* Spinning effect overlay */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-white/40 animate-spin-slow"></div>

                    {/* Active Drawn Ball */}
                    {activeNumber && (
                        <div key={`main-${step}`} className="animate-bounce-in relative z-10">
                            <LotteryBall number={activeNumber} type="main" size="lg" />
                        </div>
                    )}
                    <div className="absolute bottom-2 text-xs font-bold text-white/50 uppercase tracking-widest z-20">Main Drum</div>
                </div>

                {/* Special Machine */}
                <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-blue-400 bg-blue-900/20 backdrop-blur-sm shadow-[0_0_50px_rgba(59,130,246,0.4)] flex items-center justify-center overflow-hidden">
                     {/* Bouncing Balls inside machine */}
                     <div className="absolute inset-0">
                        {renderBouncingBalls(8, 'bg-blue-500')}
                    </div>
                    {/* Spinning effect overlay */}
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400/10 border-t-blue-400/40 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>

                    {/* Active Drawn Special Ball */}
                    {activeSpecial && (
                        <div key="special" className="animate-bounce-in relative z-10">
                            <LotteryBall number={activeSpecial} type="special" size="lg" />
                        </div>
                    )}
                    <div className="absolute bottom-2 text-xs font-bold text-blue-300 uppercase tracking-widest z-20">Star Drum</div>
                </div>

            </div>
        </div>

        {/* TV Graphics Overlay (Lower Thirds) */}
        <div className="absolute bottom-0 w-full z-30">
            {/* History Bar */}
            <div className="bg-gradient-to-r from-blue-900/90 to-blue-800/90 border-t-4 border-yellow-400 p-4 backdrop-blur-md flex items-center justify-center gap-4 shadow-2xl">
                 <div className="flex gap-2">
                    {drawResult.numbers.map((n, i) => (
                        <div key={i} className={`transform transition-all duration-500 ${i < revealedNumbers.length ? 'scale-100 opacity-100' : 'scale-50 opacity-20'}`}>
                            <LotteryBall number={n} type="main" size="md" />
                        </div>
                    ))}
                    <div className="w-px h-12 bg-white/20 mx-4"></div>
                    <div className={`transform transition-all duration-500 ${isSpecialRevealed ? 'scale-100 opacity-100' : 'scale-50 opacity-20'}`}>
                        <LotteryBall number={drawResult.special} type="special" size="md" />
                    </div>
                 </div>
            </div>

            {/* Live Stats Ticker */}
            <div className="bg-black text-white text-sm py-2 px-4 flex justify-between items-center font-mono">
                <div className="flex gap-8">
                    <span className="text-yellow-400 font-bold uppercase">Live Stats:</span>
                    <span>Tickets in Play: <strong className="text-white">{tickets.length}</strong></span>
                    <span>Jackpot Contenders: <strong className={jackpotContenders > 0 ? "text-green-400 animate-pulse" : "text-red-400"}>{jackpotContenders}</strong></span>
                    <span>Ball Match Count: <strong>{currentMatchCount}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="uppercase font-bold tracking-widest text-xs">Live Broadcast</span>
                </div>
            </div>
        </div>
        
         <style dangerouslySetInnerHTML={{__html: `
            @keyframes bounce-in {
                0% { transform: scale(0) translateY(100px); opacity: 0; }
                60% { transform: scale(1.2) translateY(-20px); opacity: 1; }
                100% { transform: scale(1) translateY(0); }
            }
            .animate-bounce-in {
                animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes bounce-chaos {
                0% { transform: translate(0, 0) scale(1); }
                25% { transform: translate(20px, -20px) scale(0.9); }
                50% { transform: translate(-15px, 15px) scale(1.1); }
                75% { transform: translate(15px, -10px) scale(0.95); }
                100% { transform: translate(0, 0) scale(1); }
            }
        `}} />

    </div>
  );
};

export default DrawAnimation;