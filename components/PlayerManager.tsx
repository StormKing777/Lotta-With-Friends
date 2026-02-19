import React, { useState } from 'react';
import { Player, Friend } from '../types';

interface PlayerManagerProps {
  players: Player[];
  friends?: Friend[]; // Optional list of friends to invite
  isCreator: boolean; // Is the current user the admin?
  onAddPlayer: (name: string) => void; // Used for "Inviting" a friend
  onRemovePlayer: (id: string) => void; // Used for Kicking
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, friends = [], isCreator, onAddPlayer, onRemovePlayer }) => {
  const [inviteMode, setInviteMode] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
            Crew ({players.length})
        </h2>
        {isCreator && (
            <button 
                onClick={() => setInviteMode(!inviteMode)}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
            >
                {inviteMode ? 'Done' : '+ Invite'}
            </button>
        )}
      </div>

      {inviteMode && isCreator && (
          <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase">Invite Friends</h4>
              {friends.filter(f => !players.find(p => p.name === f.name)).length === 0 ? (
                  <div className="text-xs text-blue-400 italic">No new friends to invite.</div>
              ) : (
                  <div className="flex flex-wrap gap-2">
                      {friends.filter(f => !players.find(p => p.name === f.name)).map(f => (
                          <button
                            key={f.id}
                            onClick={() => onAddPlayer(f.name)}
                            className="flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-full text-xs hover:bg-blue-100"
                          >
                              <span>+</span> {f.name}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {players.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group transition-colors border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-3">
              <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex flex-col">
                 <span className="font-medium text-gray-700 text-sm flex items-center gap-1">
                     {p.name}
                     {p.isUser && <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">YOU</span>}
                 </span>
                 <span className="text-[10px] text-gray-400">Winning: ${p.totalWinnings}</span>
              </div>
            </div>
            {/* Show Kick button only if current user is Creator AND target player is NOT the creator */}
            {isCreator && !p.isUser && (
                <button
                    onClick={() => onRemovePlayer(p.id)}
                    className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Kick player"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManager;