import React from 'react';
import { Player } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/lotteryUtils';

interface StatsBoardProps {
  players: Player[];
}

const StatsBoard: React.FC<StatsBoardProps> = ({ players }) => {
  const data = players.map(p => ({
    name: p.name,
    winnings: p.totalWinnings,
    tickets: p.ticketsPurchased
  })).sort((a, b) => b.winnings - a.winnings);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        Winner's Circle
      </h2>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 14 }} width={60} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Total Winnings']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="winnings" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
        {players.map((p) => (
          <div key={p.id} className="text-center">
            <div className="text-sm text-gray-500">{p.name}</div>
            <div className="font-bold text-green-600">{formatCurrency(p.totalWinnings)}</div>
            <div className="text-xs text-gray-400">{p.ticketsPurchased} tickets</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBoard;
