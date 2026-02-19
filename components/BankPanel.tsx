import React, { useState } from 'react';
import { Player, BankAccount } from '../types';
import { formatCurrency, formatUSD } from '../utils/lotteryUtils';
import { TOKENS_PER_DOLLAR } from '../constants';
import { MockBackend } from '../services/mockBackend';

interface BankPanelProps {
  players: Player[];
  groupPot: number;
  onBuyTokens: (id: string, dollarAmount: number) => void;
  onDonate: (id: string, amount: number) => void;
  onUpdatePlayer: (player: Player) => void;
}

const BankPanel: React.FC<BankPanelProps> = ({ players, groupPot, onBuyTokens, onDonate, onUpdatePlayer }) => {
  const [selectedDollarAmount, setSelectedDollarAmount] = useState<number>(10);
  const [linkingPlayerId, setLinkingPlayerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [bankForm, setBankForm] = useState<BankAccount>({ routingNumber: '', accountNumber: '', holderName: '' });

  const handleLinkBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingPlayerId) return;

    setIsProcessing(true);
    const result = await MockBackend.linkBankAccount(linkingPlayerId, bankForm);
    setIsProcessing(false);

    if (result.success) {
        const player = players.find(p => p.id === linkingPlayerId);
        if (player) onUpdatePlayer({ ...player, bankLinked: true });
        setLinkingPlayerId(null);
        setBankForm({ routingNumber: '', accountNumber: '', holderName: '' });
        alert(result.message);
    } else {
        alert(result.message);
    }
  };

  const handlePayout = async (player: Player) => {
    if (!player.bankLinked) {
        setLinkingPlayerId(player.id);
        return;
    }

    if (player.balance <= 0) return;
    
    const usdAmount = player.balance / TOKENS_PER_DOLLAR;
    if (!confirm(`Are you sure you want to withdraw ${formatCurrency(player.balance)} ($${usdAmount.toFixed(2)}) to your linked bank account?`)) return;

    setIsProcessing(true);
    const result = await MockBackend.processPayout(player.id, player.balance, usdAmount);
    setIsProcessing(false);

    if (result.success) {
        onUpdatePlayer({ ...player, balance: 0 }); // Drain balance
        alert(`SUCCESS: ${result.message}\nTrans ID: ${result.transactionId}`);
    } else {
        alert(`ERROR: ${result.message}`);
    }
  };

  if (linkingPlayerId) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Link Bank Account</h3>
            <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded mb-4">
                This app uses a secured Mock-Gateway for demo purposes. Do not enter real sensitive data.
            </div>
            <form onSubmit={handleLinkBank} className="space-y-3">
                <input 
                    className="w-full border rounded p-2 text-sm" 
                    placeholder="Account Holder Name" 
                    value={bankForm.holderName}
                    onChange={e => setBankForm({...bankForm, holderName: e.target.value})}
                    required
                />
                <input 
                    className="w-full border rounded p-2 text-sm" 
                    placeholder="Routing Number (9 digits)" 
                    value={bankForm.routingNumber}
                    maxLength={9}
                    onChange={e => setBankForm({...bankForm, routingNumber: e.target.value})}
                    required
                />
                <input 
                    className="w-full border rounded p-2 text-sm" 
                    placeholder="Account Number" 
                    value={bankForm.accountNumber}
                    type="password"
                    onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                    required
                />
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setLinkingPlayerId(null)} className="flex-1 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                    <button type="submit" disabled={isProcessing} className="flex-1 py-2 text-sm bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50">
                        {isProcessing ? 'Verifying...' : 'Secure Link'}
                    </button>
                </div>
            </form>
        </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>
            Bank & Token Shop
        </h2>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 text-blue-200">Community Prize Pot</div>
            <div className="text-xl font-black flex items-center gap-1">
                <span>🪙</span>
                {new Intl.NumberFormat('en-US').format(groupPot)}
            </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 font-bold uppercase mb-2">Buy Tokens (${1} = {TOKENS_PER_DOLLAR} Tokens)</div>
        <div className="flex gap-2">
            {[5, 10, 20, 50, 100].map(amt => (
                <button 
                    key={amt}
                    onClick={() => setSelectedDollarAmount(amt)}
                    className={`px-3 py-1 text-sm rounded-lg border-2 transition-all font-medium ${selectedDollarAmount === amt ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-blue-200'}`}
                >
                    ${amt}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {players.map((p) => (
          <div key={p.id} className="flex flex-col p-3 rounded-lg bg-gray-50 border border-gray-100 relative overflow-hidden">
            {isProcessing && linkingPlayerId === p.id && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center font-bold text-xs">Processing...</div>}
            
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                        <div className="font-bold text-gray-700 text-sm">{p.name}</div>
                        {p.bankLinked && <div className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Bank Linked</div>}
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-blue-700">{formatCurrency(p.balance)}</div>
                    <div className="text-[10px] text-gray-400">≈ {formatUSD(p.balance / TOKENS_PER_DOLLAR)}</div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                    onClick={() => onBuyTokens(p.id, selectedDollarAmount)}
                    className="bg-green-600 text-white text-[10px] font-bold py-2 rounded hover:bg-green-700 transition-colors shadow-sm"
                >
                    Buy Tokens
                </button>
                <button
                    onClick={() => onDonate(p.id, 100)}
                    disabled={p.balance < 100}
                    className="bg-purple-100 text-purple-700 text-[10px] font-bold py-2 rounded hover:bg-purple-200 disabled:opacity-50 transition-colors border border-purple-200"
                >
                    Donate 🪙100
                </button>
            </div>
            
            <button
                onClick={() => handlePayout(p)}
                className={`mt-2 w-full text-center text-[10px] py-1 rounded border transition-colors ${p.balance > 0 ? 'border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300' : 'border-transparent text-gray-300 cursor-not-allowed'}`}
                disabled={p.balance <= 0}
            >
                {p.bankLinked ? 'Withdraw to Bank' : 'Link Bank & Withdraw'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankPanel;