
import React, { useState, useMemo } from 'react';
import { Post, MarketCategory, Offer, User } from '../types';
import { ShoppingBag, Tag, Filter, ChevronRight, ChevronLeft, Send, CheckCircle2, XCircle } from 'lucide-react';

interface MarketplaceProps {
  posts: Post[];
  currentUser: User;
  offers: Offer[];
  onMakeOffer: (offer: Partial<Offer>) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ posts, currentUser, offers, onMakeOffer }) => {
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'All'>('All');
  const [priceFilter, setPriceFilter] = useState<'all' | '0-50' | '50-200' | '200+'>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'NM' | 'VG' | 'G'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'low-high' | 'high-low'>('newest');
  const [offeringPostId, setOfferingPostId] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNotes, setOfferNotes] = useState('');

  const CATEGORIES: MarketCategory[] = ["Vinyl", "Decks", "Tape Packs", "Studio Gear"];

  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => p.source === 'marketplace' || p.price)
      .filter(p => activeCategory === 'All' || p.metadata.marketCategory === activeCategory)
      .filter(p => {
        if (priceFilter === 'all') return true;
        const price = parseFloat(p.price || '0');
        if (priceFilter === '0-50') return price <= 50;
        if (priceFilter === '50-200') return price > 50 && price <= 200;
        if (priceFilter === '200+') return price > 200;
        return true;
      })
      .filter(p => conditionFilter === 'all' || p.metadata.condition === conditionFilter)
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        const priceA = parseFloat(a.price || '0');
        const priceB = parseFloat(b.price || '0');
        if (sortBy === 'low-high') return priceA - priceB;
        if (sortBy === 'high-low') return priceB - priceA;
        return 0;
      });
  }, [posts, activeCategory, priceFilter, conditionFilter, sortBy]);

  const handleSendOffer = () => {
    const post = posts.find(p => p.id === offeringPostId);
    if (!post) return;
    
    onMakeOffer({
      postId: post.id,
      toUserId: post.userId,
      amount: offerAmount,
      notes: offerNotes,
    });
    setOfferingPostId(null);
    setOfferAmount('');
    setOfferNotes('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white p-4 overflow-y-auto pb-24 no-scrollbar">
      <div className="flex justify-between items-end mb-4">
        <h2 className="font-bungee text-3xl text-[#39ff14] neon-text-green">MARKET</h2>
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Buy the culture</span>
      </div>

      {/* Categories Scroller */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
        {['All', ...CATEGORIES].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
              activeCategory === cat ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'bg-gray-900 text-gray-400 border-gray-800'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Filters & Sorting */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <select 
          value={priceFilter} 
          onChange={(e) => setPriceFilter(e.target.value as any)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-[9px] font-bold text-gray-400 outline-none"
        >
          <option value="all">ALL PRICES</option>
          <option value="0-50">UNDER £50</option>
          <option value="50-200">£50 - £200</option>
          <option value="200+">OVER £200</option>
        </select>
        <select 
          value={conditionFilter} 
          onChange={(e) => setConditionFilter(e.target.value as any)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-[9px] font-bold text-gray-400 outline-none"
        >
          <option value="all">ALL COND.</option>
          <option value="NM">MINT/NM</option>
          <option value="VG">VG/VG+</option>
          <option value="G">GOOD/G+</option>
        </select>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-2 text-[9px] font-bold text-gray-400 outline-none"
        >
          <option value="newest">NEWEST</option>
          <option value="low-high">LOW → HIGH</option>
          <option value="high-low">HIGH → LOW</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-xl text-center p-8">
          <ShoppingBag size={48} className="text-gray-800 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest">No listings found</p>
          <p className="text-xs text-gray-600 mt-2 italic">Be the first to list gear in the Studio Wizard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const postOffers = offers.filter(o => o.postId === post.id);
            return (
              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-transform active:scale-95 relative group">
                <div className="relative aspect-square">
                  {/* Photo Carousel Simulation */}
                  <img src={post.images?.[0] || post.thumbnail || `https://picsum.photos/seed/${post.id}/300`} className="w-full h-full object-cover" alt={post.trackTitle} />
                  
                  {post.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="font-bungee text-2xl text-red-500 -rotate-12 border-4 border-red-500 px-4 py-1">SOLD</span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                    <div className="bg-black/80 px-2 py-1 rounded-md flex items-center gap-1 border border-[#39ff14] shadow-lg">
                      <Tag size={10} className="text-[#39ff14]" />
                      <span className="text-[10px] font-bold text-[#39ff14]">£{post.price || '??'}</span>
                    </div>
                    {postOffers.length > 0 && (
                      <div className="bg-[#00ffff] text-black px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter shadow-lg">
                        {postOffers.length} OFFERS
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[7px] font-black text-white/70 uppercase">
                    {post.metadata.condition || 'NM'}
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs truncate leading-tight uppercase tracking-tight">{post.trackTitle}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase truncate">@{post.user.username}</p>
                  </div>
                  
                  {post.status !== 'sold' && (
                    <button 
                      onClick={() => setOfferingPostId(post.id)}
                      disabled={post.userId === currentUser.id}
                      className={`mt-3 w-full text-black text-[10px] font-bungee py-2 rounded-lg transition-all ${
                        post.userId === currentUser.id ? 'bg-gray-800 text-gray-500' : 'bg-[#39ff14] hover:shadow-[0_0_15px_#39ff14] active:scale-95'
                      }`}
                    >
                      {post.userId === currentUser.id ? 'YOUR LISTING' : 'MAKE OFFER'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Make Offer Modal */}
      {offeringPostId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOfferingPostId(null)} />
          <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[2.5rem] border-t-4 border-[#39ff14] p-6 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(57,255,20,0.2)]">
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6" />
            
            <h3 className="font-bungee text-2xl text-[#39ff14] mb-2">MAKE AN OFFER</h3>
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-6">Listing Price: £{posts.find(p => p.id === offeringPostId)?.price}</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">YOUR OFFER (£)</label>
                <input 
                  type="number" 
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-4 text-[#39ff14] font-bungee text-2xl focus:border-[#39ff14] outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">NOTES TO SELLER</label>
                <textarea 
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#39ff14] outline-none min-h-[100px] resize-none"
                  placeholder="e.g. Missing sleeve? Is it 2024 serviced?"
                />
              </div>

              <button 
                onClick={handleSendOffer}
                disabled={!offerAmount}
                className="w-full bg-[#39ff14] text-black font-bungee py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 transition-all active:scale-95"
              >
                <Send size={18} /> SEND OFFER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
