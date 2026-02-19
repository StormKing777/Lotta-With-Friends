import React from 'react';

interface LotteryBallProps {
  number: number;
  type: 'main' | 'special';
  size?: 'sm' | 'md' | 'lg';
  isMatched?: boolean;
}

const LotteryBall: React.FC<LotteryBallProps> = ({ number, type, size = 'md', isMatched = false }) => {
  
  // Using the single game theme (White and Blue)
  const ballClass = type === 'special' ? 'ball-blue text-white' : 'ball-white text-gray-900';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl font-bold',
  };

  const matchRing = isMatched ? 'ring-4 ring-green-500 transform scale-110 z-10' : '';

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${ballClass} 
      ${matchRing}
      rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 border border-black/10
    `}>
      {number}
    </div>
  );
};

export default LotteryBall;