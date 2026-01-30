
import React, { useState, useRef, useEffect } from 'react';
import { Post, PostSource, User, RaveCategory, MarketCategory, InviteCode } from '../types';
import { Trash2, Plus, Layout, Settings, Loader2, Youtube, Disc, Link as LinkIcon, Image as ImageIcon, Music, Radio, Users, Clock, ShoppingBag, X, Key, Copy, Check, AlertCircle, ChevronRight, Send, Camera, StopCircle, Zap, Calendar, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  posts: Post[];
  inviteCodes: InviteCode[];
  onAddPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onUpdatePost: (post: Post) => void;
  onGenerateCode: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, posts, inviteCodes, onAddPost, onDeletePost, onUpdatePost, onGenerateCode }) => {
  const [view, setView] = useState<'manage' | 'create' | 'live' | 'market' | 'invites' | 'events-manager'>('manage');
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [marketImages, setMarketImages] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Camera & Live States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    desc: '',
    year: '1993',
    genre: 'Jungle',
    label: '',
    type: 'single' as 'vinyl' | 'mix' | 'single' | 'live' | 'gear',
    categories: [] as RaveCategory[],
    marketCategory: 'Vinyl' as MarketCategory,
    source: 'upload' as PostSource,
    youtubeUrl: '',
    spotifyUrl: '',
    discogsUrl: '',
    isVinyl: false,
    vinylCondition: 'NM',
    vinylPrice: '',
    mediaFile: null as File | null,
    artworkFile: null as File | null,
    isAudio: false,
    guestTags: ''
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Camera Management
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: true 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied. Check permissions.");
    }
  };

  // Instant Preview Sync
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      finalizeLivePost(videoUrl);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    
    // Auto-stop after 30s as requested
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecording();
      }
    }, 30000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const finalizeLivePost = (videoUrl: string) => {
    const newPost: Post = {
      id: `post-live-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      user: currentUser,
      trackTitle: `LIVE: ${formData.title || 'UNNAMED SIGNAL'}`,
      artist: currentUser.username,
      description: formData.desc || 'Real-time transmission from the underground.',
      likes: 0, reposts: 0, shares: 0, comments: [],
      source: 'live',
      categories: ['global', 'mixes', 'live'],
      isLive: false, // It was live, now it's a replay but tagged as live source
      watchCount: Math.floor(Math.random() * 200) + 50,
      metadata: {
        year: '2025',
        genre: 'Live Session',
        type: 'live'
      },
      videoUrl: videoUrl,
      thumbnail: 'https://picsum.photos/seed/live/600/1000'
    };
    onAddPost(newPost);
    stopCamera();
    setView('manage');
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const isAudio = file.type.startsWith('audio/');
      setFormData({
        ...formData,
        mediaFile: file,
        isAudio: isAudio,
        source: 'upload'
      });
    }
  };

  const handleMarketImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files)
        .slice(0, 4 - marketImages.length)
        .map((f: File) => URL.createObjectURL(f));
      setMarketImages([...marketImages, ...newImages]);
    }
  };

  const handleCreate = async (isLivePost = false, isMarketPost = false) => {
    if (!isLivePost && !isMarketPost && formData.isAudio && !formData.artworkFile) {
      alert('🎵 Artwork is required for MP3 uploads to power the vinyl spinner!');
      return;
    }

    setIsUploading(true);
    
    let yid = '';
    if (formData.youtubeUrl) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = formData.youtubeUrl.match(regExp);
      yid = (match && match[7].length === 11) ? match[7] : '';
    }

    const categories: string[] = ['global'];
    const yearNum = parseInt(formData.year);
    if (yearNum >= 1990 && yearNum <= 1999) categories.push('90s');
    if (formData.genre) categories.push(formData.genre.toLowerCase());
    if (isLivePost || formData.type === 'mix') categories.push('mixes');
    if (formData.isVinyl || formData.isAudio) categories.push('vinyl');

    const mediaUrl = formData.mediaFile ? URL.createObjectURL(formData.mediaFile) : undefined;
    const artworkUrl = formData.artworkFile ? URL.createObjectURL(formData.artworkFile) : undefined;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
      user: currentUser,
      trackTitle: isMarketPost ? formData.title : (isLivePost ? `LIVE: ${formData.title}` : (formData.title || 'Untitled')),
      artist: isMarketPost ? 'Marketplace Listing' : (formData.artist || currentUser.displayName),
      description: formData.desc,
      likes: 0, reposts: 0, shares: 0, comments: [],
      source: isMarketPost ? 'marketplace' : (isLivePost ? 'live' : (yid ? 'youtube' : 'upload')),
      categories: categories,
      isLive: isLivePost,
      watchCount: isLivePost ? Math.floor(Math.random() * 50) + 10 : undefined,
      metadata: {
        year: formData.year,
        genre: formData.genre,
        type: isMarketPost ? 'gear' : (isLivePost ? 'live' : (formData.isVinyl ? 'vinyl' : formData.type)),
        condition: formData.vinylCondition,
        price: formData.vinylPrice,
        guestTags: formData.guestTags.split(' ').filter(t => t.startsWith('@')),
        marketCategory: isMarketPost ? formData.marketCategory : undefined
      },
      year: formData.year,
      genre: formData.genre,
      label: formData.label,
      youtubeId: yid,
      thumbnail: isMarketPost ? marketImages[0] : (yid ? `https://img.youtube.com/vi/${yid}/maxresdefault.jpg` : (artworkUrl || (isLivePost ? 'https://picsum.photos/seed/live/600/1000' : undefined))),
      images: isMarketPost ? marketImages : undefined,
      price: formData.vinylPrice || undefined,
      status: 'active',
      videoUrl: !formData.isAudio ? mediaUrl : undefined,
      audioUrl: formData.isAudio ? mediaUrl : undefined
    };

    onAddPost(newPost);
    setIsUploading(false);
    setView('manage');
    setStep(1);
    setMarketImages([]);
    setFormData({
      title: '', artist: '', desc: '', year: '1993', genre: 'Jungle', label: '',
      type: 'single', categories: [], marketCategory: 'Vinyl', source: 'upload', youtubeUrl: '', spotifyUrl: '',
      discogsUrl: '', isVinyl: false, vinylCondition: 'NM', vinylPrice: '',
      mediaFile: null, artworkFile: null, isAudio: false, guestTags: ''
    });
  };

  const handleApproveEvent = (post: Post) => {
    const updatedPost: Post = {
      ...post,
      metadata: { ...post.metadata, eventStatus: 'approved' }
    };
    onUpdatePost(updatedPost);
  };

  const handleRejectEvent = (post: Post) => {
    const updatedPost: Post = {
      ...post,
      metadata: { ...post.metadata, eventStatus: 'rejected' }
    };
    onUpdatePost(updatedPost);
  };

  const isAdmin = currentUser.role === 'admin';
  const pendingEvents = posts.filter(p => p.metadata.type === 'event' && p.metadata.eventStatus === 'pending');
  const totalRevenue = posts.filter(p => p.metadata.type === 'event').length * 49;

  return (
    <div className="flex-1 flex flex-col bg-[#000] text-white p-4 overflow-y-auto pb-24 no-scrollbar">
      <div className="flex items-center justify-between mb-6 pt-16">
        <div className="flex items-center gap-2">
          <Settings className="text-[#39ff14]" />
          <h2 className="font-bungee text-2xl tracking-tighter">STUDIO CONTROL</h2>
        </div>
        {isAdmin && (
           <div className="bg-[#39ff14]/10 border border-[#39ff14]/30 px-3 py-1 rounded-full">
             <span className="text-[10px] font-black text-[#39ff14] uppercase tracking-widest">Sys_Admin</span>
           </div>
        )}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => { setView('manage'); stopCamera(); }} className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border-2 transition-all duration-300 ${view === 'manage' ? 'border-[#00ffff] bg-[#00ffff]/10 text-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-white/5 text-gray-500'}`}>MANAGEMENT</button>
        <button onClick={() => { setView('create'); stopCamera(); }} className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border-2 transition-all duration-300 ${view === 'create' ? 'border-[#ff00ff] bg-[#ff00ff]/10 text-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.2)]' : 'border-white/5 text-gray-500'}`}>WIZARD</button>
        {isAdmin && (
          <button onClick={() => { setView('events-manager'); stopCamera(); }} className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border-2 transition-all duration-300 ${view === 'events-manager' ? 'border-[#00ffff] bg-[#00ffff]/10 text-[#00ffff] shadow-[0_0_15px_#00ffff]' : 'border-white/5 text-gray-500'}`}>EVENT OPS</button>
        )}
        <button onClick={() => { setView('market'); stopCamera(); }} className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border-2 transition-all duration-300 ${view === 'market' ? 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'border-white/5 text-gray-500'}`}>SELL GEAR</button>
        <button onClick={() => { setView('live'); }} className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border-2 transition-all duration-300 ${view === 'live' ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 text-gray-500'}`}>LIVE STUDIO</button>
        {isAdmin && (
          <button onClick={() => { setView('invites'); stopCamera(); }} className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold border-2 transition-all duration-300 ${view === 'invites' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/5 text-gray-500'}`}>INVITES</button>
        )}
      </div>

      {view === 'manage' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-2">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Active Broadcasts</p>
             <span className="text-[10px] font-bold text-[#00ffff]">{posts.filter(p => p.userId === currentUser.id).length} TOTAL</span>
          </div>
          {posts.filter(p => p.userId === currentUser.id).length === 0 ? (
            <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[2rem]">
              <Disc size={48} className="mx-auto mb-4" />
              <p className="font-bungee text-xs uppercase">No broadcasts found</p>
            </div>
          ) : (
            posts.filter(p => p.userId === currentUser.id).map(post => (
              <div key={post.id} className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-white/5 group hover:border-[#00ffff]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg overflow-hidden relative border border-white/10">
                    <img src={post.thumbnail || 'https://picsum.photos/100'} className="w-full h-full object-cover" alt="Thumb" />
                    {post.isLive && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-black" />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs truncate w-40 text-white group-hover:text-[#00ffff] transition-colors">{post.trackTitle}</h4>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">{post.artist} • {post.year}</p>
                  </div>
                </div>
                <button onClick={() => onDeletePost(post.id)} className="text-gray-700 p-2 hover:text-red-500 transition-all hover:scale-110"><Trash2 size={18} /></button>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'events-manager' && isAdmin && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 pb-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">TOTAL REV</p>
              <h4 className="font-bungee text-2xl text-[#39ff14]">€{totalRevenue}</h4>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">QUEUED</p>
              <h4 className="font-bungee text-2xl text-[#00ffff]">{pendingEvents.length}</h4>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bungee text-lg text-white ml-2">PENDING APPROVALS</h3>
            {pendingEvents.length === 0 ? (
               <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                <Calendar size={48} className="mx-auto mb-4" />
                <p className="font-bungee text-xs uppercase">No events in queue</p>
              </div>
            ) : (
              pendingEvents.map(event => (
                <div key={event.id} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex gap-4">
                    <img src={event.thumbnail} className="w-16 h-16 rounded-xl object-cover border border-white/10" alt="T" />
                    <div>
                      <h4 className="font-bungee text-lg text-[#00ffff]">{event.trackTitle}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">BY @{event.user.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveEvent(event)} className="flex-1 bg-[#39ff14] text-black font-bungee text-[10px] py-3 rounded-xl active:scale-95 transition-all">APPROVE (LIVE)</button>
                    <button onClick={() => handleRejectEvent(event)} className="flex-1 bg-red-500 text-white font-bungee text-[10px] py-3 rounded-xl active:scale-95 transition-all">REJECT</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Wizard, Market, Live, Invites sections remain unchanged */}
      {/* ... (rest of the file logic preserved but omitted for brevity if unchanged, 
          ensuring the component remains complete in the final output block) ... */}
      
      {view === 'create' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
          <div className="flex justify-between px-10 relative mb-10">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-900 -z-10 -translate-y-1/2" />
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${step >= s ? 'bg-[#ff00ff] border-[#ff00ff] text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]' : 'bg-black border-zinc-800 text-gray-600'}`}>
                {step > s ? <Check size={20} /> : s}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="text-center mb-6">
                 <h3 className="font-bungee text-xl text-white">SELECT MEDIA</h3>
                 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">MP3, MP4 or YouTube Stream</p>
               </div>

               <div className="relative border-2 border-dashed border-zinc-800 rounded-[2rem] p-12 text-center hover:border-[#ff00ff] transition-all bg-zinc-900/20 group overflow-hidden">
                  <input type="file" accept="video/*,audio/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileChange} />
                  {formData.mediaFile ? (
                    <div className="text-[#39ff14] flex flex-col items-center animate-in zoom-in-95 duration-300">
                       <div className="w-16 h-16 bg-[#39ff14]/10 rounded-full flex items-center justify-center mb-4">
                         {formData.isAudio ? <Music size={32} /> : <Disc size={32} />}
                       </div>
                       <p className="text-xs font-black truncate max-w-[240px] uppercase tracking-tighter">{formData.mediaFile.name}</p>
                       <p className="text-[10px] text-gray-500 mt-2">Tap to change file</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff00ff]/20 transition-all">
                        <Plus size={32} className="text-gray-600 group-hover:text-[#ff00ff]" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Select Local File</p>
                    </>
                  )}
               </div>

               <div className="flex items-center gap-4 text-gray-800 my-4">
                 <div className="h-px flex-1 bg-zinc-900" />
                 <span className="text-[9px] font-black uppercase tracking-widest">or bridge youtube</span>
                 <div className="h-px flex-1 bg-zinc-900" />
               </div>
               
               <div className="relative">
                 <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                 <input className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-14 pr-4 py-4 text-sm focus:border-red-500 outline-none transition-all font-bold placeholder:text-gray-700" placeholder="PASTE URL..." value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} />
               </div>

               <button onClick={() => setStep(2)} disabled={!formData.mediaFile && !formData.youtubeUrl} className="w-full bg-white text-black font-bungee py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-2">CONTINUE <ChevronRight size={18} /></button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <div className="text-center mb-6">
                 <h3 className="font-bungee text-xl text-white">METADATA SYNC</h3>
                 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">ID3 tags and categorization</p>
               </div>

               <div className="space-y-2">
                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">TRACK TITLE</label>
                 <input className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ff00ff] outline-none font-bold" placeholder="E.g. Original Nuttah" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
               </div>

               <div className="space-y-2">
                 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">ARTIST / COLLECTIVE</label>
                 <input className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#00ffff] outline-none font-bold" placeholder="E.g. Shy FX" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">YEAR</label>
                   <select className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm appearance-none outline-none font-bold" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                      {['1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2024'].map(y => <option key={y} className="bg-black">{y}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">GENRE</label>
                   <select className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm appearance-none outline-none font-bold" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                      {['Hardcore', 'Jungle', 'DnB', 'Breakbeat', 'Gabber', 'Techno'].map(g => <option key={g} className="bg-black">{g}</option>)}
                   </select>
                 </div>
               </div>

               <div className="pt-6 flex gap-3">
                 <button onClick={() => setStep(1)} className="px-6 py-5 rounded-2xl border border-zinc-800 text-gray-500 font-bungee hover:text-white transition-colors">BACK</button>
                 <button onClick={() => setStep(3)} className="flex-1 bg-[#39ff14] text-black font-bungee py-5 rounded-2xl shadow-[0_10px_30px_rgba(57,255,20,0.2)]">NEXT PHASE</button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="text-center mb-4">
                 <h3 className="font-bungee text-xl text-white">FINAL TRANSMISSION</h3>
                 <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Review and dispatch to global feed</p>
               </div>

               {formData.isAudio && (
                 <div className="bg-[#ff00ff]/5 border border-[#ff00ff]/20 rounded-3xl p-6 mb-4">
                   <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="text-[#ff00ff]" size={20} />
                      <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">ARTWORK REQUIRED FOR VINYL ENGINE</p>
                   </div>
                   <div className="relative border-2 border-dashed border-[#ff00ff]/30 rounded-2xl p-6 text-center hover:border-[#ff00ff] transition-all group bg-black">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={e => setFormData({...formData, artworkFile: e.target.files?.[0] || null})} />
                      {formData.artworkFile ? (
                        <div className="flex items-center justify-center gap-4">
                          <img src={URL.createObjectURL(formData.artworkFile)} className="w-16 h-16 object-cover rounded-xl border-2 border-[#ff00ff] shadow-lg" alt="Preview" />
                          <div className="text-left">
                            <p className="text-[10px] text-[#ff00ff] font-black uppercase">Visual Locked</p>
                            <p className="text-[9px] text-gray-500 truncate max-w-[120px]">{formData.artworkFile.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon size={24} className="text-gray-600 group-hover:text-[#ff00ff] mb-2" />
                          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Select Visual / Label Art</p>
                        </div>
                      )}
                   </div>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">BROADCAST DESCRIPTION</label>
                  <textarea 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl px-5 py-4 text-sm focus:border-[#ff00ff] outline-none min-h-[140px] resize-none font-medium leading-relaxed" 
                    placeholder="Tell the junglists the history behind this plate..." 
                    value={formData.desc} 
                    onChange={e => setFormData({...formData, desc: e.target.value})} 
                  />
               </div>

               <div className="flex gap-3 pt-4">
                 <button onClick={() => setStep(2)} className="px-6 py-5 rounded-2xl border border-zinc-800 text-gray-500 font-bungee">BACK</button>
                 <button 
                  onClick={() => handleCreate()} 
                  disabled={isUploading} 
                  className="flex-1 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white font-bungee py-5 rounded-2xl shadow-[0_15px_40px_rgba(255,0,255,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all"
                 >
                   {isUploading ? <Loader2 className="animate-spin" /> : <>INITIALIZE FEED <Send size={18} /></>}
                 </button>
               </div>
            </div>
          )}
        </div>
      )}

      {view === 'market' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
          <div className="bg-[#39ff14]/5 border border-[#39ff14]/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={120} /></div>
             <div className="relative z-10">
               <div className="w-16 h-16 bg-[#39ff14] rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-[0_0_20px_#39ff14]">
                 <ShoppingBag size={32} />
               </div>
               <h3 className="font-bungee text-2xl text-[#39ff14] tracking-tighter">LIST YOUR GEAR</h3>
               <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">Sync with Dublin's underground network</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">GALLERY (MAX 4)</p>
                <span className="text-[9px] text-[#39ff14] font-bold">{marketImages.length}/4</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {marketImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-zinc-900 rounded-xl relative overflow-hidden border border-white/5 shadow-inner group">
                    <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    <button onClick={() => setMarketImages(marketImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                  </div>
                ))}
                {marketImages.length < 4 && (
                  <div className="aspect-square bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center relative hover:border-[#39ff14] transition-all bg-zinc-900/40 group">
                    <input type="file" multiple accept="image/*" onChange={handleMarketImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Plus size={24} className="text-zinc-700 group-hover:text-[#39ff14] group-hover:scale-110 transition-all" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">ITEM NAME</label>
                <input className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#39ff14] outline-none font-bold" placeholder="E.g. Technics SL-1210 MK2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">CATEGORY</label>
                  <select className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm appearance-none outline-none font-bold" value={formData.marketCategory} onChange={e => setFormData({...formData, marketCategory: e.target.value as any})}>
                    <option className="bg-black">Vinyl</option>
                    <option className="bg-black">Decks</option>
                    <option className="bg-black">Tape Packs</option>
                    <option className="bg-black">Studio Gear</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">CONDITION</label>
                  <select className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-sm appearance-none outline-none font-bold" value={formData.vinylCondition} onChange={e => setFormData({...formData, vinylCondition: e.target.value})}>
                    <option value="NM" className="bg-black">NM (MINT)</option>
                    <option value="VG" className="bg-black">VG/VG+</option>
                    <option value="G" className="bg-black">GOOD/G+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">PRICE (£)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#39ff14] font-black">£</span>
                  <input className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-5 py-4 text-sm focus:border-[#39ff14] outline-none font-bungee" placeholder="0.00" value={formData.vinylPrice} onChange={e => setFormData({...formData, vinylPrice: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">SPECIFICATIONS</label>
                <textarea 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] px-5 py-4 text-sm focus:border-[#39ff14] outline-none min-h-[120px] resize-none font-medium" 
                  placeholder="Tell the community about the history and technical specs..." 
                  value={formData.desc} 
                  onChange={e => setFormData({...formData, desc: e.target.value})} 
                />
              </div>

              <button 
                onClick={() => handleCreate(false, true)}
                disabled={!formData.title || !formData.vinylPrice || marketImages.length === 0}
                className="w-full bg-[#39ff14] text-black font-bungee py-5 rounded-2xl shadow-[0_10px_30px_rgba(57,255,20,0.3)] disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                POST LISTING <Check size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'live' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-10 flex flex-col items-center">
          {!isCameraActive ? (
            <div className="w-full space-y-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Radio size={140} /></div>
                <div className="relative z-10">
                  <Radio className="mx-auto text-red-500 mb-6 animate-pulse" size={56} />
                  <h3 className="font-bungee text-2xl text-red-500 tracking-tighter">LIVE STUDIO</h3>
                  <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black leading-relaxed">Broadcast real-time rave signals</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">BROADCAST TITLE</label>
                  <input 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-sm focus:border-red-500 outline-none font-bold text-white" 
                    placeholder="E.g. Sunday Morning Dubwise Session" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>
                
                <button onClick={startCamera} className="w-full bg-white text-black font-bungee py-6 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95">
                  <Camera size={20} /> INITIATE CAMERA
                </button>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col">
              {/* Camera Preview */}
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover mirror"
              />
              
              {/* Vibe Overlays */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 bg-gradient-to-b from-black/40 via-transparent to-black/60">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <div className="bg-red-600 text-white px-3 py-1 rounded font-bungee text-sm flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                      <Radio size={14} /> LIVE READY
                    </div>
                    <div className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 self-start mt-2">
                      @{currentUser.username}
                    </div>
                  </div>
                  <button 
                    onClick={stopCamera} 
                    className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white pointer-events-auto border border-white/20 active:scale-90 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 mb-10 pointer-events-auto">
                   {isRecording ? (
                     <button 
                      onClick={stopRecording}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_white] animate-pulse"
                     >
                       <StopCircle size={40} className="text-red-500" />
                     </button>
                   ) : (
                     <button 
                      onClick={startRecording}
                      className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-90 transition-all group"
                     >
                        <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap size={32} className="text-white fill-white" />
                        </div>
                     </button>
                   )}
                   <p className="font-bungee text-white text-xs tracking-widest drop-shadow-md">
                     {isRecording ? "RECORDING BROADCAST..." : "BROADCAST 30S"}
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'invites' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-10">
           <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-[2.5rem] p-10 text-center">
             <Key className="mx-auto text-yellow-500 mb-4" size={48} />
             <h3 className="font-bungee text-2xl text-yellow-500 tracking-tighter">NETWORK PASSES</h3>
             <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">Authorize the next generation of rave legends</p>
          </div>

          <button 
            onClick={onGenerateCode}
            className="w-full bg-yellow-500 text-black font-bungee py-5 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.3)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={20} /> GENERATE DJ PASS
          </button>

          <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ENCRYPTED CODES</p>
                <span className="text-[9px] text-yellow-500 font-bold uppercase">{inviteCodes.length} ISSUED</span>
             </div>
             {inviteCodes.length === 0 ? (
               <div className="p-16 text-center border-2 border-dashed border-zinc-900 rounded-[2rem] bg-zinc-900/10">
                 <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Network is currently private</p>
               </div>
             ) : (
               inviteCodes.map(code => (
                 <div key={code.code} className="glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-yellow-500/30 transition-all">
                    <div>
                      <p className="font-bungee text-xl text-yellow-500 tracking-widest">{code.code}</p>
                      <p className="text-[8px] font-black text-gray-600 uppercase mt-1 tracking-widest">
                        Status: {code.usedBy ? <span className="text-[#39ff14]">CLAIMED BY @{code.usedBy.toUpperCase()}</span> : <span className="text-yellow-500/50">PENDING TRANSMISSION</span>}
                      </p>
                    </div>
                    {!code.usedBy && (
                      <button 
                        onClick={() => handleCopy(code.code)}
                        className={`p-3 rounded-xl transition-all active:scale-90 ${copiedCode === code.code ? 'bg-[#39ff14] text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                      >
                        {copiedCode === code.code ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    )}
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation-duration: 0.4s;
          animation-fill-mode: both;
        }
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
