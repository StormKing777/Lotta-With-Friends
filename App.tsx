import React, { useState } from 'react';
import { UserProfile, Group, Player, Friend, DrawFrequency } from './types';
import Registration from './components/Registration';
import GameInterface from './components/GameInterface';
import FriendsPage from './components/FriendsPage';
import CreatePoolModal from './components/CreatePoolModal';
import { MOCK_PLAYERS } from './constants';
import { formatCurrency } from './utils/lotteryUtils';

type ViewState = 'DASHBOARD' | 'FRIENDS' | 'GAME';

const App: React.FC = () => {
  // Application State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Friends State
  const [friends, setFriends] = useState<Friend[]>([
    { id: 'f1', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/50/50', status: 'ONLINE' },
    { id: 'f2', name: 'Bob', avatar: 'https://picsum.photos/seed/bob/50/50', status: 'OFFLINE' },
    { id: 'f3', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/50/50', status: 'ONLINE' },
  ]);

  // Groups State
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 'g1',
      creatorId: 'system',
      name: 'Office Pool 101',
      description: 'The weekly office shenanigans. Don\'t tell the boss!',
      pot: 12500,
      ticketCost: 100,
      drawFrequency: 'WEEKLY_1X',
      nextDrawTime: Date.now() + 1000 * 60 * 60 * 24 * 2,
      members: MOCK_PLAYERS,
      tickets: [],
      history: [],
      createdDate: Date.now()
    },
    {
      id: 'g2',
      creatorId: 'system',
      name: 'High Rollers Club',
      description: 'Big buy-ins, huge payouts. Invite only.',
      pot: 50000,
      ticketCost: 500, // Expensive
      drawFrequency: 'DAILY',
      nextDrawTime: Date.now() + 1000 * 60 * 60 * 12,
      members: MOCK_PLAYERS.slice(0, 2),
      tickets: [],
      history: [],
      createdDate: Date.now()
    }
  ]);

  const handleRegister = (profile: UserProfile) => {
    setCurrentUser(profile);
    const userPlayer: Player = {
        id: profile.id,
        name: profile.legalName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.legalName)}&background=0D8ABC&color=fff`,
        totalWinnings: 0,
        ticketsPurchased: 0,
        balance: 1000,
        bankLinked: false,
        isUser: true
    };

    setGroups(prev => prev.map(g => ({
        ...g,
        members: [...g.members, userPlayer]
    })));
  };

  const handleCreateGroup = (name: string, ticketCost: number, frequency: DrawFrequency, selectedFriendIds: string[], firstDrawTime: number) => {
    if (!currentUser) return;

    const userPlayer: Player = {
        id: currentUser.id,
        name: currentUser.legalName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.legalName)}&background=0D8ABC&color=fff`,
        totalWinnings: 0,
        ticketsPurchased: 0,
        balance: 1000,
        bankLinked: false,
        isUser: true
    };

    // Convert invited friends to Players
    const invitedPlayers = selectedFriendIds.map(fid => {
        const friend = friends.find(f => f.id === fid);
        if(!friend) return null;
        return {
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar,
            totalWinnings: 0,
            ticketsPurchased: 0,
            balance: 500, // Joining Bonus for them
            bankLinked: false,
            isUser: false
        } as Player;
    }).filter(Boolean) as Player[];

    const newGroup: Group = {
        id: crypto.randomUUID(),
        creatorId: currentUser.id,
        name,
        description: `Hosted by ${currentUser.legalName}`,
        pot: 1000, // Initial Seed
        ticketCost: ticketCost,
        drawFrequency: frequency,
        nextDrawTime: firstDrawTime,
        members: [userPlayer, ...invitedPlayers],
        tickets: [],
        history: [],
        createdDate: Date.now()
    };
    
    setGroups([...groups, newGroup]);
    setShowCreateModal(false);
    setActiveGroupId(newGroup.id);
    setCurrentView('GAME');
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleAddFriend = (name: string) => {
      const newFriend: Friend = {
          id: crypto.randomUUID(),
          name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
          status: 'OFFLINE' // Default
      };
      setFriends([...friends, newFriend]);
  };

  const handleRemoveFriend = (id: string) => {
      setFriends(friends.filter(f => f.id !== id));
  };

  // --- Views ---

  if (!currentUser) {
    return <Registration onRegister={handleRegister} />;
  }

  if (currentView === 'GAME' && activeGroupId) {
    const activeGroup = groups.find(g => g.id === activeGroupId);
    if (activeGroup) {
        return (
            <GameInterface 
                userProfile={currentUser} 
                group={activeGroup}
                friends={friends}
                onUpdateGroup={handleUpdateGroup} 
                onBack={() => {
                    setActiveGroupId(null);
                    setCurrentView('DASHBOARD');
                }} 
            />
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
             <div className="flex items-center gap-2 font-black text-xl text-blue-900 tracking-tight">
                <div className="bg-blue-600 text-white p-1 rounded">LF</div>
                Lotto & Friends
             </div>
             
             <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setCurrentView('DASHBOARD')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${currentView === 'DASHBOARD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Lobby
                 </button>
                 <button 
                    onClick={() => setCurrentView('FRIENDS')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${currentView === 'FRIENDS' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Friends
                 </button>
             </div>

             <div className="flex items-center gap-2">
                 <div className="text-right hidden md:block">
                     <div className="text-sm font-bold text-slate-700">{currentUser.legalName}</div>
                     <div className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Verified</div>
                 </div>
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.legalName)}&background=0D8ABC&color=fff`} className="w-9 h-9 rounded-full border border-slate-200" alt="profile" />
             </div>
          </div>
      </nav>

      {currentView === 'FRIENDS' && (
          <FriendsPage 
            friends={friends} 
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
          />
      )}

      {currentView === 'DASHBOARD' && (
          <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 animate-fade-in-down">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Game Lobby</h1>
                    <p className="text-slate-500">Jump into a pool or start your own game.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Empty Placement Slot for New Creation */}
                <div 
                    onClick={() => setShowCreateModal(true)}
                    className="border-2 border-dashed border-blue-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors group h-full min-h-[240px]"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Create Your Own Pool</h3>
                    <p className="text-sm text-blue-500 px-4">Set your own pot rates, rules, and invite your friends.</p>
                </div>

                {/* 2. Existing Pools */}
                {groups.map(group => (
                    <div 
                        key={group.id} 
                        onClick={() => {
                            setActiveGroupId(group.id);
                            setCurrentView('GAME');
                        }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all group flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 uppercase">
                                        {group.drawFrequency}
                                    </span>
                                    {group.creatorId === currentUser.id && (
                                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full border border-purple-200 uppercase">
                                            Owner
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{group.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 h-10 overflow-hidden text-ellipsis">{group.description}</p>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                            <div className="flex -space-x-2 overflow-hidden">
                                {group.members.slice(0, 4).map(m => (
                                    <img key={m.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200" src={m.avatar} alt={m.name} />
                                ))}
                                {group.members.length > 4 && (
                                    <div className="h-8 w-8 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-xs font-bold text-slate-500">
                                        +{group.members.length - 4}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400 font-bold uppercase">Ticket Cost</div>
                                <div className="font-black text-blue-600 text-lg">{formatCurrency(group.ticketCost)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {showCreateModal && (
          <CreatePoolModal 
            friends={friends}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGroup}
          />
      )}
    </div>
  );
};

export default App;