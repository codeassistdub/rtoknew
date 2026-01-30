
import React, { useRef, useEffect, useState } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, Music, ExternalLink, ShoppingCart, Disc, Play, Plus, Radio, Eye, CheckCircle, Ticket, ShieldCheck } from 'lucide-react';
import { RAVE_FALLBACKS } from '../constants';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoCardProps {
  post: Post;
  isActive: boolean;
  isMuted: boolean;
  isUserLiked: boolean;
  isInCrate?: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onAddToCrate: () => void;
  onPlayYoutube: (youtubeId: string) => void;
  onProfileClick: () => void;
}

const YouTubeAudio: React.FC<{ youtubeId: string; isActive: boolean; isMuted: boolean }> = ({ youtubeId, isActive, isMuted }) => {
  const playerRef = useRef<any>(null);
  const containerId = `yt-player-${youtubeId}`;
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        playerRef.current = new window.YT.Player(containerId, {
          height: '0',
          width: '0',
          videoId: youtubeId,
          playerVars: {
            autoplay: isActive ? 1 : 0,
            mute: isMuted ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 1,
            playlist: youtubeId
          },
          events: {
            onReady: (event: any) => {
              if (isActive) event.target.playVideo();
              if (isMuted) event.target.mute(); else event.target.unMute();
            },
            onStateChange: (event: any) => {
              if (event.data === 1 && fallbackAudioRef.current) {
                fallbackAudioRef.current.pause();
              }
            },
            onError: () => {
              if (fallbackAudioRef.current && isActive) {
                fallbackAudioRef.current.play().catch(() => {});
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch(e) {}
        playerRef.current = null;
      }
    };
  }, [youtubeId, containerId]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.getPlayerState) {
      if (isActive) playerRef.current.playVideo(); else playerRef.current.pauseVideo();
    }
    if (fallbackAudioRef.current) {
      if (isActive) fallbackAudioRef.current.play().catch(() => {}); else fallbackAudioRef.current.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.mute) {
      if (isMuted) playerRef.current.mute(); else playerRef.current.unMute();
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <>
      <div id={containerId} className="absolute inset-0 opacity-0 pointer-events-none h-0 w-0" />
      <audio ref={fallbackAudioRef} src={RAVE_FALLBACKS[youtubeId] || RAVE_FALLBACKS.default} loop muted={isMuted} className="hidden" />
    </>
  );
};

const formatLikes = (num: number): string => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const VideoCard: React.FC<VideoCardProps> = ({ 
  post, 
  isActive, 
  isMuted, 
  isUserLiked,
  isInCrate,
  onLike, 
  onComment, 
  onShare, 
  onAddToCrate,
  onProfileClick
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTapRef = useRef<number>(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const isPureMP3 = !!post.audioUrl && !post.videoUrl && post.source !== 'youtube';
  const isYouTube = post.source === 'youtube' && !!post.youtubeId;
  const isVideo = !!post.videoUrl;
  const isLive = post.isLive;
  const isEvent = post.metadata.type === 'event';
  const isVerified = post.user.role === 'admin' || post.user.role === 'verified' || post.user.isVerified;

  useEffect(() => {
    if (isActive) {
      if (isVideo && videoRef.current) videoRef.current.play().catch(() => {});
      if (isPureMP3 && audioRef.current) audioRef.current.play().catch(() => {});
    } else {
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    }
  }, [isActive, isVideo, isPureMP3]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isUserLiked) onLike();
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
    }
    lastTapRef.current = now;
  };

  const handleAddCrate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCrate();
  };

  const handleProfileTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProfileClick();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
    
    const shareUrl = `https://ravetok.com/${isEvent ? 'event' : 'post'}/${post.id}`;
    const shareTitle = post.trackTitle || "RaveTok Transmission";
    const shareText = isEvent ? `🎪 ${post.trackTitle} tickets` : `🔥 Check out this track on RaveTok: ${post.trackTitle}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleGetTickets = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.metadata.ticketUrl) {
      window.open(post.metadata.ticketUrl, '_blank');
    }
  };

  return (
    <div className={`relative w-full h-full bg-black snap-child flex flex-col items-center justify-center overflow-hidden cursor-pointer vhs-effect ${isLive ? 'border-2 border-red-500/20' : ''}`} onClick={handleTap}>
      <div className="w-full h-full relative">
        
        {/* Overlays for Live and Events */}
        {isLive && (
          <div className="absolute top-20 left-0 w-full z-40 bg-gradient-to-r from-red-600 to-transparent px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="font-bungee text-[10px] text-white tracking-widest flex items-center gap-2">
                <Radio size={12} /> 🔴 LIVE NOW
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
              <Eye size={10} className="text-white" />
              <span className="text-[9px] font-bold text-white">{post.watchCount || '12'}</span>
            </div>
          </div>
        )}

        {isEvent && (
          <div className="absolute top-20 left-0 w-full z-40 bg-gradient-to-r from-[#00ffff] to-transparent px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-white" />
              <span className="font-bungee text-[10px] text-white tracking-widest">
                🎪 SPONSORED EVENT
              </span>
            </div>
          </div>
        )}

        {!isLive && !isEvent && (
          <div className="absolute top-24 left-4 flex flex-wrap gap-1.5 z-30 max-w-[70%]">
            {post.categories.filter(c => c !== 'global').map(cat => (
              <span key={cat} className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-[#ff00ff]/50 rounded-full text-[9px] font-black tracking-widest text-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.3)] uppercase">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Media Rendering */}
        {isYouTube || isPureMP3 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
            <img src={post.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-3xl scale-125 transition-all duration-1000" alt="Ambient" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className={`absolute -inset-4 bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#39ff14] rounded-full opacity-20 group-hover:opacity-40 blur-xl ${isActive ? 'animate-pulse' : ''}`} />
                <div className={`${isActive ? 'vinyl-disc-anim' : ''} relative w-64 h-64 rounded-full border-[8px] border-[#111] shadow-[0_0_50px_rgba(255,0,255,0.4)] flex items-center justify-center bg-black transition-transform duration-700`}>
                   <div className="absolute inset-0 rounded-full border border-white/5" />
                   <div className="absolute inset-4 rounded-full border border-white/5" />
                   <div className="absolute inset-8 rounded-full border border-white/5" />
                   <div className="absolute inset-12 rounded-full border border-white/5" />
                   <div className="w-24 h-24 rounded-full bg-[#ff00ff] border-4 border-black shadow-[inset_0_0_15px_black] overflow-hidden flex items-center justify-center relative">
                      <img src={post.thumbnail} className="w-full h-full object-cover opacity-80" alt="Label" />
                      <div className="absolute w-4 h-4 bg-black rounded-full border border-white/20" />
                   </div>
                </div>
              </div>
              <div className="mt-12 text-center px-10">
                <h2 className="font-bungee text-3xl text-white neon-text-pink mb-2 drop-shadow-lg leading-tight">{post.trackTitle}</h2>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="font-bold text-xl text-[#00ffff] uppercase tracking-tighter neon-text-cyan">{post.artist}</p>
                  {isVerified && <CheckCircle size={16} className="text-[#39ff14] fill-black" />}
                </div>
              </div>
            </div>
            
            {isYouTube && <YouTubeAudio youtubeId={post.youtubeId!} isActive={isActive} isMuted={isMuted} />}
            {isPureMP3 && <audio ref={audioRef} src={post.audioUrl} loop muted={isMuted} className="hidden" />}
          </div>
        ) : isVideo || isLive || isEvent ? (
          <video ref={videoRef} src={post.videoUrl} className="w-full h-full object-cover" loop muted={isMuted} playsInline />
        ) : (
          <div className="w-full h-full relative bg-gray-900 flex flex-col items-center justify-center text-center p-6">
            <img src={post.thumbnail || post.user.avatar} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" alt="Background" />
            <div className="relative z-10 space-y-4">
              <div className="w-48 h-48 mx-auto rounded-full border-4 border-[#ff00ff] shadow-[0_0_20px_#ff00ff] overflow-hidden">
                <img src={post.thumbnail || post.user.avatar} className="w-full h-full object-cover" alt="Cover" />
              </div>
              <h2 className="font-bungee text-2xl text-[#00ffff]">{post.trackTitle}</h2>
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-white text-lg font-bold">{post.artist}</p>
                {isVerified && <CheckCircle size={18} className="text-[#39ff14] fill-black" />}
              </div>
            </div>
          </div>
        )}

        {showHeartOverlay && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="animate-heart-explode"><Heart size={100} fill="#ff00ff" className="text-[#ff00ff] drop-shadow-[0_0_20px_#ff00ff]" /></div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 pointer-events-none" />

        {/* Action Buttons */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
          <div className="flex flex-col items-center group">
            <button onClick={(e) => { e.stopPropagation(); onLike(); }} className={`p-3 bg-black/40 rounded-full transition-all transform group-active:scale-150 ${isUserLiked ? 'text-[#ff00ff]' : 'text-white hover:text-[#ff00ff]'}`}>
              <Heart size={32} fill={isUserLiked ? "#ff00ff" : "none"} className={isUserLiked ? "animate-bounce-short shadow-[0_0_15px_#ff00ff]" : ""} />
            </button>
            <span className={`text-[10px] font-bold mt-1 font-mono uppercase ${isUserLiked ? 'text-[#ff00ff]' : 'text-white'}`}>{formatLikes(post.likes)}</span>
          </div>

          {!isLive && !isEvent && (
            <div className="flex flex-col items-center group">
              <button onClick={handleAddCrate} className={`p-3 bg-black/40 rounded-full transition-all transform group-active:scale-110 ${isInCrate ? 'text-[#39ff14] shadow-[0_0_15px_#39ff14]' : 'text-white hover:text-[#39ff14]'}`}>
                <Plus size={32} className={isInCrate ? "rotate-45" : ""} />
              </button>
              <span className={`text-[9px] font-black mt-1 uppercase tracking-widest ${isInCrate ? 'text-[#39ff14]' : 'text-white'}`}>{isInCrate ? 'IN CRATE' : 'CRATE'}</span>
            </div>
          )}

          <div className="flex flex-col items-center group">
            <button onClick={(e) => { e.stopPropagation(); onComment(); }} className="p-3 bg-black/40 rounded-full text-white hover:text-[#00ffff] transition-colors relative">
              <MessageCircle size={32} />
              {post.comments.length > 0 && <span className="absolute top-1 right-1 bg-[#00ffff] text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-black min-w-[18px] shadow-[0_0_8px_#00ffff]">{post.comments.length}</span>}
            </button>
            <span className="text-[10px] font-bold mt-1 font-mono text-white">REPLY</span>
          </div>

          <div className="flex flex-col items-center group relative">
            {showCopied && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#39ff14] text-black text-[9px] font-black px-2 py-1 rounded shadow-[0_0_10px_#39ff14] whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                LINK COPIED!
              </div>
            )}
            <button onClick={handleShare} className="p-3 bg-black/40 rounded-full text-white hover:text-[#39ff14] transition-colors group-active:scale-110"><Share2 size={32} /></button>
            <span className="text-[10px] font-bold mt-1 font-mono text-white">SHARE</span>
          </div>
          
          <div onClick={handleProfileTap} className="relative group/orb active:scale-95 transition-transform">
             <div className="absolute -inset-1 bg-gradient-to-tr from-[#ff00ff] to-[#00ffff] rounded-full blur-[4px] opacity-75 group-hover/orb:opacity-100 animate-pulse" />
             <div className="w-14 h-14 rounded-full border-2 border-white/50 overflow-hidden relative shadow-2xl">
               <img src={post.user.avatar} className="w-full h-full object-cover scale-110 group-hover/orb:scale-125 transition-transform" alt="User" />
               {isVerified && <div className="absolute bottom-0 right-0 bg-[#39ff14] rounded-full p-0.5 border border-black"><CheckCircle size={10} className="text-black fill-black" /></div>}
             </div>
          </div>
        </div>

        {/* Caption and CTA Area */}
        <div className="absolute left-4 bottom-24 right-20 z-20 space-y-3 pointer-events-none">
          {/* CTA for Events */}
          {isEvent && (
            <button 
              onClick={handleGetTickets}
              className="pointer-events-auto w-full bg-[#00ffff] text-black font-bungee py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-all text-sm mb-4"
            >
              <Ticket size={18} /> GET TICKETS →
            </button>
          )}

          <div onClick={handleProfileTap} className="flex items-center gap-2 pointer-events-auto cursor-pointer group/user">
            <span className="font-bold text-lg neon-text-cyan group-hover/user:neon-text-pink transition-all">@{post.user.username}</span>
            {isVerified && <CheckCircle size={14} className="text-[#39ff14] fill-black" />}
          </div>
          
          <p className="text-sm line-clamp-2 text-gray-200 drop-shadow-md pointer-events-auto">{post.description}</p>
          
          <div className="flex flex-wrap gap-2 pointer-events-auto">
            {post.year && <span className="glass-panel text-white text-[9px] px-2 py-1 rounded font-bold border-white/10">{post.year}</span>}
            {post.genre && <span className="glass-panel text-[#00ffff] text-[9px] px-2 py-1 rounded font-bold uppercase border-[#00ffff]/20">{post.genre}</span>}
            {isLive ? (
              <span className="glass-panel text-red-500 text-[9px] px-2 py-1 rounded font-bold uppercase border-red-500/20 animate-pulse">LIVE BROADCAST</span>
            ) : isEvent ? (
              <span className="glass-panel text-[#39ff14] text-[9px] px-2 py-1 rounded font-bold uppercase border-[#39ff14]/20">UPCOMING EVENT</span>
            ) : post.label && (
              <span className="glass-panel text-[#ff00ff] text-[9px] px-2 py-1 rounded font-bold uppercase border-[#ff00ff]/20">{post.label}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
