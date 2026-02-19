import React, { useState } from 'react';
import { DrawFrequency, Friend } from '../types';

interface CreatePoolModalProps {
  onClose: () => void;
  onCreate: (name: string, ticketCost: number, frequency: DrawFrequency, selectedFriendIds: string[], firstDrawTime: number) => void;
  friends: Friend[];
}

const CreatePoolModal: React.FC<CreatePoolModalProps> = ({ onClose, onCreate, friends }) => {
  const [name, setName] = useState('');
  const [ticketCost, setTicketCost] = useState(100);
  const [frequency, setFrequency] = useState<DrawFrequency>('DAILY');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  
  // Default to 1 hour from now for first draw
  const [startTime, setStartTime] = useState<string>(
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const firstDraw = frequency === 'INSTANT' ? Date.now() : new Date(startTime).getTime();
    onCreate(name, ticketCost, frequency, selectedFriends, firstDraw);
  };

  const toggleFriend = (id: string) => {
    if (selectedFriends.includes(id)) {
        setSelectedFriends(selectedFriends.filter(fid => fid !== id));
    } else {
        setSelectedFriends([...selectedFriends, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Create New Pool
            </h2>
            <button onClick={onClose} className="hover:bg-blue-500 p-1 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pool Name</label>
                <input 
                    autoFocus
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. The Winning Team"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pot Rate</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🪙</span>
                        <input 
                            type="number"
                            min="10"
                            step="10"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={ticketCost}
                            onChange={e => setTicketCost(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Draw Frequency</label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                        value={frequency}
                        onChange={e => setFrequency(e.target.value as DrawFrequency)}
                    >
                        <option value="INSTANT">⚡ Instant (Demo)</option>
                        <optgroup label="Minutes">
                            <option value="EVERY_5_MIN">Every 5 Minutes</option>
                            <option value="EVERY_10_MIN">Every 10 Minutes</option>
                            <option value="EVERY_15_MIN">Every 15 Minutes</option>
                            <option value="EVERY_20_MIN">Every 20 Minutes</option>
                            <option value="EVERY_25_MIN">Every 25 Minutes</option>
                            <option value="EVERY_30_MIN">Every 30 Minutes</option>
                        </optgroup>
                        <optgroup label="Hourly">
                            <option value="HOURLY">Every Hour</option>
                            <option value="EVERY_2_HOURS">Every 2 Hours</option>
                            <option value="EVERY_3_HOURS">Every 3 Hours</option>
                            <option value="EVERY_4_HOURS">Every 4 Hours</option>
                            <option value="EVERY_8_HOURS">Every 8 Hours</option>
                            <option value="EVERY_12_HOURS">Every 12 Hours</option>
                        </optgroup>
                        <optgroup label="Long Term">
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY_3X">3x Weekly</option>
                            <option value="WEEKLY_2X">2x Weekly</option>
                            <option value="WEEKLY_1X">Weekly</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {frequency !== 'INSTANT' && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">First Live Broadcast Time</label>
                    <input 
                        type="datetime-local"
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Invite Friends ({selectedFriends.length})</label>
                {friends.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border border-dashed text-center">
                        Add friends from the Friends tab to invite them!
                    </div>
                ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 custom-scrollbar">
                        {friends.map(friend => (
                            <div 
                                key={friend.id} 
                                onClick={() => toggleFriend(friend.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all ${selectedFriends.includes(friend.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent'}`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedFriends.includes(friend.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                    {selectedFriends.includes(friend.id) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>}
                                </div>
                                <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
                                <span className="text-sm font-medium text-gray-700">{friend.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button 
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
            >
                Create Pool & Schedule Draw
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoolModal;