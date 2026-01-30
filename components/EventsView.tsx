
import React, { useState, useMemo } from 'react';
import { Post, User } from '../types';
import { Calendar, Tag, Plus, Send, X, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

interface EventsViewProps {
  posts: Post[];
  currentUser: User;
  onSponsor: (post: Post) => void;
  onViewPost: (post: Post) => void;
}

const EventsView: React.FC<EventsViewProps> = ({ posts, currentUser, onSponsor, onViewPost }) => {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketUrl: '',
    videoFile: null as File | null,
    artworkFile: null as File | null,
  });

  const sponsoredEvents = useMemo(() => {
    return posts.filter(p => p.metadata.type === 'event' && p.metadata.eventStatus === 'approved');
  }, [posts]);

  const handleSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoFile) return;

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const post: Post = {
      id: `event-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      trackTitle: formData.title,
      artist: "SPONSORED EVENT",
      description: formData.description,
      likes: 0, reposts: 0, shares: 0, comments: [],
      source: 'event',
      categories: ['events', 'global'],
      metadata: {
        type: 'event',
        eventStatus: 'pending',
        ticketUrl: formData.ticketUrl,
        isSponsored: true
      },
      videoUrl: URL.createObjectURL(formData.videoFile),
      thumbnail: formData.artworkFile ? URL.createObjectURL(formData.artworkFile) : 'https://picsum.photos/seed/event/600/1000',
      createdAt: new Date().toISOString(),
      price: '49' // Sponsorship fee
    };

    onSponsor(post);
    setIsProcessing(false);
    setShowSponsorModal(false);
    setFormData({ title: '', description: '', ticketUrl: '', videoFile: null, artworkFile: null });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white p-4 overflow-y-auto pb-24 no-scrollbar">
      <div className="flex justify-between items-end mb-6 pt-16">
        <div>
          <h2 className="font-bungee text-3xl text-[#00ffff] neon-text-cyan">EVENTS</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Underground Dublin & Beyond</p>
        </div>
        <button 
          onClick={() => setShowSponsorModal(true)}
          className="bg-[#39ff14] text-black font-bungee text-[10px] px-4 py-2 rounded-full shadow-[0_0_15px_#39ff14] active:scale-95 transition-all"
        >
          SPONSOR EVENT
        </button>
      </div>

      <div className="space-y-6">
        {sponsoredEvents.length === 0 ? (
          <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <Calendar size={64} className="mx-auto mb-4" />
            <p className="font-bungee text-sm uppercase">No broadcasts scheduled</p>
          </div>
        ) : (
          sponsoredEvents.map(event => (
            <div key={event.id} className="relative group rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-900/40">
              <div className="aspect-video relative overflow-hidden">
                <img src={event.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 right-4 bg-[#39ff14] text-black text-[8px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  <ShieldCheck size={10} /> SPONSORED
                </div>
              </div>
              
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bungee text-xl text-[#00ffff] leading-none">{event.trackTitle}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">HOSTED BY @{event.user.username}</p>
                  </div>
                  <button onClick={() => onViewPost(event)} className="p-2 glass-panel rounded-full text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors">
                    <Send size={18} />
                  </button>
                </div>
                
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{event.description}</p>
                
                <div className="flex gap-2 pt-2">
                  <a 
                    href={event.metadata.ticketUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-white text-black font-bungee text-[10px] py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    GET TICKETS <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sponsor Modal */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowSponsorModal(false)} />
          <div className="relative w-full max-w-sm glass-panel p-8 rounded-[2.5rem] border-2 border-[#39ff14] shadow-[0_0_50px_rgba(57,255,20,0.1)] animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh] no-scrollbar">
            <button onClick={() => setShowSponsorModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
            <h3 className="font-bungee text-2xl text-[#39ff14] mb-6 tracking-tighter">SPONSOR EVENT</h3>
            
            <form onSubmit={handleSponsor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">EVENT TITLE</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#39ff14] outline-none font-bold" placeholder="E.g. Rave in the Woods" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">DESCRIPTION</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#39ff14] outline-none h-24 resize-none" placeholder="Tell the network what to expect..." />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">TICKET URL</label>
                <input value={formData.ticketUrl} onChange={e => setFormData({...formData, ticketUrl: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-[#39ff14] outline-none" placeholder="https://tickets.rave..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">PROMO VIDEO</label>
                  <div className="relative h-20 bg-zinc-900 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center group overflow-hidden">
                    <input required type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFormData({...formData, videoFile: e.target.files?.[0] || null})} />
                    {formData.videoFile ? <p className="text-[8px] text-[#39ff14] font-bold truncate px-2">{formData.videoFile.name}</p> : <Plus className="text-gray-600" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">THUMBNAIL</label>
                  <div className="relative h-20 bg-zinc-900 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFormData({...formData, artworkFile: e.target.files?.[0] || null})} />
                    {formData.artworkFile ? <p className="text-[8px] text-[#39ff14] font-bold truncate px-2">{formData.artworkFile.name}</p> : <Plus className="text-gray-600" />}
                  </div>
                </div>
              </div>

              <div className="bg-[#39ff14]/5 border border-[#39ff14]/20 p-4 rounded-2xl flex flex-col items-center mt-6">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">TOTAL SPONSORSHIP FEE</p>
                <h4 className="font-bungee text-3xl text-[#39ff14]">€49.00</h4>
                <p className="text-[8px] text-zinc-600 uppercase font-black mt-1 tracking-tighter">SECURE STRIPE TRANSMISSION</p>
              </div>

              <button 
                type="submit"
                disabled={isProcessing || !formData.title || !formData.videoFile}
                className="w-full bg-[#39ff14] text-black font-bungee py-4 rounded-xl shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <>PAY & BROADCAST</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsView;
