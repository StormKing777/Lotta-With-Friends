import React, { useState } from 'react';
import { Friend } from '../types';

interface FriendsPageProps {
  friends: Friend[];
  onAddFriend: (name: string) => void;
  onRemoveFriend: (id: string) => void;
}

const FriendsPage: React.FC<FriendsPageProps> = ({ friends, onAddFriend, onRemoveFriend }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAddFriend(searchQuery.trim());
      setSearchQuery('');
      alert(`Sent friend request to ${searchQuery}! (Auto-accepted for demo)`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Friends</h1>
                <p className="text-slate-500 text-sm">Manage your contact list for pool invites.</p>
            </div>
            
            <form onSubmit={handleAdd} className="flex gap-2 w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Add friend by username..." 
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" disabled={!searchQuery.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                    Add
                </button>
            </form>
        </div>

        <div className="p-6">
            {friends.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <p>You haven't added any friends yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map(friend => (
                        <div key={friend.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">{friend.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{friend.status}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onRemoveFriend(friend.id)}
                                className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"
                                title="Remove Friend"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;