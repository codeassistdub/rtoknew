
import React, { useState } from 'react';
import { User, Post, LibraryTrack, Offer } from '../types';
import { Settings, Share2, Grid, Bookmark, Edit2, Check, UserPlus, UserCheck, Trophy, ChevronRight, X, Camera, ShoppingBag, Bell, CheckCircle2, XCircle, CheckCircle, Key, Disc, Tag, Mail, Trash2 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  isCurrentUser: boolean;
  isFollowing: boolean;
  userPosts: Post[];
  userCrate: LibraryTrack[];
  offers: Offer[];
  onFollow: () => void;
  onEditProfile: (updates: Partial<User>) => void;
  onPostClick: (post: Post) => void;
  onUpdateOffer: (offerId: string, status: Offer['status']) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  isCurrentUser, 
  isFollowing, 
  userPosts, 
  userCrate, 
  offers,
  onFollow, 
  onEditProfile,
  onPostClick,
  onUpdateOffer
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'crate' | 'market' | 'offers'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(user.bio || '');
  const [isCopied, setIsCopied] = useState(false);

  const marketPosts = userPosts.filter(p => p.source === 'marketplace' || p.price);
  const receivedOffers = offers.filter(o => o.toUserId === user.id);
  const isVerified = user.role === 'admin' || user.role === 'verified' || user.isVerified;

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?user=${user.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-y-auto pb-24 no-scrollbar">
      <div className="relative h-32 bg-gradient-to-r from-[#ff00ff]/20 via-[#00ffff]/20 to-[#39ff14]/20 flex-shrink-0">
        <div className="absolute -bottom-12 left-6">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-tr from-[#ff00ff] to-[#00ffff] rounded-full blur-[4px] animate-pulse`} />
            <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden relative shadow-2xl bg-gray-900">
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
              {isVerified && <div className="absolute bottom-1 right-1 bg-[#39ff14] rounded-full p-1 border-2 border-black shadow-lg"><CheckCircle size={14} className="text-black fill-black" /></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 mt-4">
        {isCurrentUser ? (
          <>
            {!isVerified && (
               <button className="px-6 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-full font-bungee text-[10px] flex items-center gap-2">
                 <Key size={12} /> GET VERIFIED
               </button>
            )}
            <button onClick={handleShareProfile} className={`px-6 py-2 rounded-full font-bungee text-[10px] transition-all ${isCopied ? 'bg-[#39ff14] text-black' : 'bg-[#00ffff] text-black'}`}>
              {isCopied ? 'COPIED!' : 'SHARE'}
            </button>
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 glass-panel rounded-full font-bungee text-[10px]">EDIT</button>
          </>
        ) : (
          <button onClick={onFollow} className={`px-6 py-2 rounded-full font-bungee text-xs transition-all active:scale-95 ${isFollowing ? 'bg-black text-[#39ff14] border-2 border-[#39ff14]' : 'bg-[#ff00ff] text-white shadow-[0_5px_15px_rgba(255,0,255,0.3)]'}`}>
            {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
          </button>
        )}
      </div>

      <div className="px-6 mt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bungee tracking-tighter">@{user.username}</h2>
          {isVerified && <CheckCircle size={20} className="text-[#39ff14] fill-black" />}
        </div>
        <p className="text-[#00ffff] text-xs font-bold uppercase">{user.displayName}</p>
        <p className="text-gray-400 text-xs mt-2 italic max-w-xs">{user.bio}</p>
        
        <div className="flex gap-4 mt-4">
          <div className="flex flex-col">
            <span className="font-bungee text-sm">{user.followers}</span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest">RAVERS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bungee text-sm">{user.following}</span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest">FOLLOWING</span>
          </div>
        </div>
      </div>

      <div className="flex mt-6 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-20">
        <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 flex items-center justify-center transition-colors ${activeTab === 'posts' ? 'border-b-2 border-[#ff00ff] text-[#ff00ff]' : 'text-gray-500 hover:text-white'}`}><Grid size={18} /></button>
        <button onClick={() => setActiveTab('crate')} className={`flex-1 py-3 flex items-center justify-center transition-colors ${activeTab === 'crate' ? 'border-b-2 border-[#00ffff] text-[#00ffff]' : 'text-gray-500 hover:text-white'}`}><Disc size={18} /></button>
        <button onClick={() => setActiveTab('market')} className={`flex-1 py-3 flex items-center justify-center transition-colors ${activeTab === 'market' ? 'border-b-2 border-[#39ff14] text-[#39ff14]' : 'text-gray-500 hover:text-white'}`}><ShoppingBag size={18} /></button>
        {isCurrentUser && (
          <button onClick={() => setActiveTab('offers')} className={`flex-1 py-3 flex items-center justify-center relative transition-colors ${activeTab === 'offers' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-white'}`}>
            <Bell size={18} />
            {receivedOffers.some(o => o.status === 'pending') && <div className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </button>
        )}
      </div>

      <div className="flex-1">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-0.5 animate-in fade-in duration-300">
            {userPosts.length === 0 ? (
               <div className="col-span-3 py-20 text-center opacity-20">
                 <Disc size={48} className="mx-auto mb-4" />
                 <p className="font-bungee text-[10px] uppercase">No broadcasts</p>
               </div>
            ) : userPosts.map(p => (
              <div key={p.id} onClick={() => onPostClick(p)} className="aspect-[3/4] bg-gray-900 overflow-hidden relative group cursor-pointer border border-white/5">
                <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Thumb" />
                {p.isLive && <div className="absolute top-1 right-1 bg-red-600 text-[6px] font-black px-1 rounded animate-pulse">LIVE</div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Tag size={12} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'crate' && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
             {userCrate.length === 0 ? (
               <div className="py-20 text-center opacity-20">
                 <Bookmark size={48} className="mx-auto mb-4" />
                 <p className="font-bungee text-[10px] uppercase">Crate empty</p>
               </div>
             ) : userCrate.map(track => (
               <div key={track.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 group hover:border-[#00ffff]/30 transition-all">
                  <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                    <img src={track.artwork} className="w-full h-full object-cover" alt="Art" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Disc size={16} className="animate-spin-slow text-white" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-sm truncate">{track.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{track.artist}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">{track.year}</span>
                      <span className="text-[8px] bg-[#00ffff]/10 px-1.5 py-0.5 rounded text-[#00ffff] border border-[#00ffff]/20">{track.genre}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-[#00ffff] transition-colors"><ChevronRight size={18} /></button>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="grid grid-cols-2 gap-4 p-4 animate-in fade-in duration-300">
             {marketPosts.length === 0 ? (
               <div className="col-span-2 py-20 text-center opacity-20">
                 <ShoppingBag size={48} className="mx-auto mb-4" />
                 <p className="font-bungee text-[10px] uppercase">No items for sale</p>
               </div>
             ) : marketPosts.map(p => (
               <div key={p.id} onClick={() => onPostClick(p)} className="bg-gray-900/50 rounded-2xl overflow-hidden border border-white/5 relative group cursor-pointer">
                  <div className="aspect-square relative overflow-hidden">
                    <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Item" />
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-md border border-[#39ff14] text-[#39ff14] font-bold text-[10px]">
                      £{p.price}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-[11px] truncate uppercase">{p.trackTitle}</h4>
                    <p className="text-[8px] text-gray-500 mt-1">{p.metadata.marketCategory || 'VINYL'}</p>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'offers' && isCurrentUser && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
             {receivedOffers.length === 0 ? (
               <div className="py-20 text-center opacity-20">
                 <Mail size={48} className="mx-auto mb-4" />
                 <p className="font-bungee text-[10px] uppercase">No active offers</p>
               </div>
             ) : receivedOffers.map(offer => (
               <div key={offer.id} className={`p-5 rounded-2xl border-2 transition-all ${offer.status === 'pending' ? 'border-[#ff00ff]/20 bg-[#ff00ff]/5' : 'border-white/5 bg-white/5 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">OFFER FROM @{offer.fromUsername}</p>
                      <h4 className="font-bungee text-2xl text-[#39ff14]">£{offer.amount}</h4>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${offer.status === 'accepted' ? 'bg-[#39ff14] text-black' : offer.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
                      {offer.status}
                    </div>
                  </div>
                  {offer.notes && <p className="text-xs text-gray-300 bg-black/40 p-3 rounded-xl border border-white/5 mb-4 italic">"{offer.notes}"</p>}
                  
                  {offer.status === 'pending' && (
                    <div className="flex gap-2">
                       <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateOffer(offer.id, 'accepted'); }}
                        className="flex-1 bg-[#39ff14] text-black font-bungee text-[10px] py-3 rounded-xl shadow-[0_5px_15px_rgba(57,255,20,0.2)] active:scale-95 transition-all"
                       >
                         ACCEPT
                       </button>
                       <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateOffer(offer.id, 'rejected'); }}
                        className="flex-1 bg-red-500 text-white font-bungee text-[10px] py-3 rounded-xl active:scale-95 transition-all"
                       >
                         DECLINE
                       </button>
                    </div>
                  )}
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-sm glass-panel p-8 rounded-[2.5rem] border-2 border-[#ff00ff] shadow-[0_0_50px_rgba(255,0,255,0.2)] animate-in zoom-in-95 duration-200">
            <h3 className="font-bungee text-2xl text-[#ff00ff] text-center mb-6">EDIT NODE</h3>
            <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">BIO</label>
                 <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#ff00ff] outline-none min-h-[100px] resize-none"
                  placeholder="Tell the network your story..."
                 />
               </div>
               <button 
                onClick={() => { onEditProfile({ bio: editBio }); setIsEditing(false); }}
                className="w-full bg-[#ff00ff] text-white font-bungee py-4 rounded-xl active:scale-95 transition-all shadow-lg"
               >
                 SYNC PROFILE
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
