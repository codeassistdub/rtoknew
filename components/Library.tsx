
import React, { useState } from 'react';
import { LibraryTrack } from '../types';
import { Play, Share, CheckCircle, Search, Filter, Loader2, Check } from 'lucide-react';

interface LibraryProps {
  tracks: LibraryTrack[];
  onPostToFeed: (track: LibraryTrack) => void;
}

const Library: React.FC<LibraryProps> = ({ tracks, onPostToFeed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  
  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendToFeed = (track: LibraryTrack) => {
    setBroadcastingId(track.id);
    // Visual delay to simulate processing/broadcast
    setTimeout(() => {
      onPostToFeed(track);
      setBroadcastingId(null);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white p-4 overflow-y-auto pb-24">
      {/* Crate Header */}
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex justify-between items-end">
          <h2 className="font-bungee text-3xl text-[#00ffff] neon-text-cyan tracking-tighter">THE CRATE</h2>
          <span className="text-[#39ff14] text-[10px] font-bold uppercase bg-[#39ff14]/10 px-2 py-1 rounded border border-[#39ff14]/20">
            {tracks.length} PLATES ARCHIVED
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your records..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00ffff] transition-colors"
          />
        </div>
      </div>

      {/* Crate Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4 text-gray-800">
               <Filter size={32} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Crate Empty</p>
            <p className="text-gray-600 text-xs mt-2 italic">Upload tracks in the Studio to build your archive.</p>
          </div>
        ) : (
          filteredTracks.map((track) => (
            <div 
              key={track.id} 
              className="bg-gray-900/40 rounded-2xl p-3 flex gap-4 border border-gray-800/50 hover:border-[#ff00ff]/50 transition-all group relative overflow-hidden"
            >
              {/* Subtle Vinyl Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

              {/* Record/Label Visual */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {/* Vinyl Disc Mockup */}
                <div className="absolute inset-1 rounded-full bg-black border border-gray-800 shadow-xl group-hover:rotate-45 transition-transform duration-700" />
                {/* Center Label */}
                <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-[#00ffff]/20 z-10">
                   <img src={track.artwork} className="w-full h-full object-cover" alt={track.title} />
                   <div className="absolute inset-0 bg-black/20" />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#050505] rounded-full border border-gray-800" />
                </div>
                
                <button className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-xl">
                  <Play size={32} className="text-[#39ff14] fill-[#39ff14]" />
                </button>
              </div>

              {/* Track Metadata */}
              <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm leading-tight text-white group-hover:text-[#00ffff] transition-colors truncate w-40">{track.title}</h3>
                    {track.verified && <CheckCircle size={12} className="text-[#00ffff] flex-shrink-0" />}
                  </div>
                  <p className="text-gray-400 text-[11px] font-medium">{track.artist}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] text-gray-500 bg-black/40 px-1.5 py-0.5 rounded border border-gray-800 uppercase font-bold tracking-tighter">
                      {track.genre}
                    </span>
                    <span className="text-[9px] text-gray-500 bg-black/40 px-1.5 py-0.5 rounded border border-gray-800 uppercase font-bold tracking-tighter">
                      {track.year}
                    </span>
                    <span className="text-[9px] text-[#39ff14]/70 bg-black/40 px-1.5 py-0.5 rounded border border-[#39ff14]/10 uppercase font-bold tracking-tighter">
                      {track.label}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => handleSendToFeed(track)}
                    disabled={broadcastingId === track.id}
                    className={`flex items-center gap-1.5 text-black text-[10px] font-bungee px-4 py-1.5 rounded-full transition-all shadow-lg active:scale-95 ${
                      broadcastingId === track.id 
                        ? 'bg-[#39ff14] shadow-[0_0_15px_#39ff14]' 
                        : 'bg-[#00ffff] hover:bg-[#ff00ff] hover:text-white'
                    }`}
                  >
                    {broadcastingId === track.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        BROADCASTING...
                      </>
                    ) : (
                      <>
                        <Share size={12} />
                        SEND TO FEED
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decorative Footer */}
      <div className="mt-8 text-center opacity-20">
         <p className="text-[8px] font-bungee tracking-[0.3em] text-gray-500 italic">SYSTEM-X CRATE ENGINE V2.4</p>
      </div>
    </div>
  );
};

export default Library;
