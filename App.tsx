
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Post, LibraryTrack, Offer, InviteCode, UserRole, Comment, AppNotification } from './types';
import { COLORS, MOCK_USER, SEED_POSTS, INITIAL_LIBRARY } from './constants';
import LandingPage from './components/LandingPage';
import VideoCard from './components/VideoCard';
import Library from './components/Library';
import Marketplace from './components/Marketplace';
import AdminDashboard from './components/AdminDashboard';
import ProfileView from './components/ProfileView';
import EventsView from './components/EventsView';
import CommentsModal from './components/CommentsModal';
import NotificationToast from './components/NotificationToast';
import { 
  Home, 
  PlusSquare, 
  ShoppingBag, 
  Radio, 
  User as UserIcon, 
  ChevronLeft, 
  Key, 
  Disc,
  Clock,
  Zap,
  Wind,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ravetok_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'admin' | 'market' | 'profile' | 'events'>('feed');
  const [activeTimeline, setActiveTimeline] = useState<'all' | '90s' | 'jungle' | 'vinyl'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data State
  const [cloudPosts, setCloudPosts] = useState<Post[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [localLibrary, setLocalLibrary] = useState<LibraryTrack[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // UI State
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [userLikedPosts, setUserLikedPosts] = useState<Record<string, boolean>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState('');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('ravetok_user');
    const savedPosts = localStorage.getItem('ravetok_posts');
    const savedOffers = localStorage.getItem('ravetok_offers');
    const savedInvites = localStorage.getItem('ravetok_invites');
    const savedLibrary = localStorage.getItem('ravetok_library');
    const savedLikes = localStorage.getItem('ravetok_likes');
    const savedFollows = localStorage.getItem('ravetok_follows');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedLikes) setUserLikedPosts(JSON.parse(savedLikes));
    if (savedFollows) setFollowingIds(new Set(JSON.parse(savedFollows)));
    
    if (savedPosts) {
      setCloudPosts(JSON.parse(savedPosts));
    } else {
      setCloudPosts(SEED_POSTS);
      localStorage.setItem('ravetok_posts', JSON.stringify(SEED_POSTS));
    }

    if (savedOffers) setOffers(JSON.parse(savedOffers));
    if (savedInvites) setInviteCodes(JSON.parse(savedInvites));

    if (savedLibrary) {
      setLocalLibrary(JSON.parse(savedLibrary));
    } else {
      setLocalLibrary(INITIAL_LIBRARY);
      localStorage.setItem('ravetok_library', JSON.stringify(INITIAL_LIBRARY));
    }

    // Request Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('ravetok_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save state on updates
  useEffect(() => {
    localStorage.setItem('ravetok_posts', JSON.stringify(cloudPosts));
  }, [cloudPosts]);

  useEffect(() => {
    localStorage.setItem('ravetok_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('ravetok_invites', JSON.stringify(inviteCodes));
  }, [inviteCodes]);

  useEffect(() => {
    localStorage.setItem('ravetok_library', JSON.stringify(localLibrary));
  }, [localLibrary]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ravetok_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Notifications Logic
  const triggerNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveNotification(newNotif);

    // Browser Push
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`RaveTok: ${title}`, { body: message, icon: '/favicon.ico' });
    }

    // Auto-clear toast after 5s
    setTimeout(() => setActiveNotification(prev => prev?.id === newNotif.id ? null : prev), 5000);
  };

  // Mock "Upcoming Event" notification after login
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        triggerNotification(
          "EVENT STARTING SOON", 
          "Helter Skelter '95 Replay starts in 10 minutes!", 
          "event"
        );
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Social Handlers
  const handleLike = (postId: string) => {
    setUserLikedPosts(prev => {
      const isLiked = !!prev[postId];
      const updated = { ...prev, [postId]: !isLiked };
      localStorage.setItem('ravetok_likes', JSON.stringify(updated));
      return updated;
    });

    setCloudPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, likes: p.likes + (userLikedPosts[postId] ? -1 : 1) } : p
    ));
  };

  const handleToggleCrate = (post: Post) => {
    const exists = localLibrary.some(t => t.id === post.id);
    if (exists) {
      setLocalLibrary(prev => prev.filter(t => t.id !== post.id));
    } else {
      const newTrack: LibraryTrack = {
        id: post.id,
        title: post.trackTitle,
        artist: post.artist,
        label: post.label || 'Unknown',
        year: post.year || '199X',
        genre: post.genre || 'Rave',
        artwork: post.thumbnail || post.user.avatar,
        previewUrl: post.audioUrl || post.videoUrl || '',
        verified: post.user.role === 'verified' || post.user.role === 'admin'
      };
      setLocalLibrary(prev => [newTrack, ...prev]);
    }
  };

  const handleAddComment = (postId: string, commentText: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      text: commentText,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setCloudPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
    ));
  };

  const handleFollow = (userId: string) => {
    setFollowingIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      localStorage.setItem('ravetok_follows', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Auth Handlers
  const handleJoin = (email: string, handle: string, isAdmin: boolean) => {
    const assignedRole: UserRole = isAdmin ? 'admin' : 'user';
    const newUser: User = { 
      ...MOCK_USER, 
      id: `user-${Date.now()}`, 
      username: handle.toUpperCase(), 
      displayName: handle,
      followers: isAdmin ? 999 : 0,
      following: 0,
      bio: isAdmin ? "NETWORK ADMINISTRATOR | 1992-∞" : "RAVETOK PIONEER",
      role: assignedRole,
      isVerified: isAdmin
    };
    setCurrentUser(newUser);
  };

  const handleUpgrade = () => {
    const codeObj = inviteCodes.find(c => c.code === upgradeCode && !c.usedBy);
    if (!codeObj || !currentUser) {
      alert("Invalid or already used invite code!");
      return;
    }
    const updatedUser: User = { ...currentUser, role: 'verified', isVerified: true };
    setInviteCodes(prev => prev.map(c => c.code === upgradeCode ? { ...c, usedBy: currentUser.username } : c));
    setCurrentUser(updatedUser);
    setShowUpgradeModal(false);
    setUpgradeCode('');
  };

  // Post Filtering Logic
  const filteredPosts = useMemo(() => {
    let posts = [...cloudPosts];
    
    if (activeTab === 'feed') {
      posts = posts.filter(p => !(p.metadata.type === 'event' && p.metadata.eventStatus !== 'approved'));
      if (activeTimeline === '90s') {
        posts = posts.filter(p => p.year?.includes('90') || p.categories.includes('90s'));
      } else if (activeTimeline === 'jungle') {
        posts = posts.filter(p => p.genre?.toLowerCase() === 'jungle' || p.categories.includes('jungle'));
      } else if (activeTimeline === 'vinyl') {
        posts = posts.filter(p => p.metadata.type === 'vinyl' || p.categories.includes('vinyl') || p.source === 'marketplace');
      }
    }
    return posts.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      const isAVerified = a.user.role === 'verified' || a.user.role === 'admin';
      const isBVerified = b.user.role === 'verified' || b.user.role === 'admin';
      if (isAVerified && !isBVerified) return -1;
      if (!isAVerified && isBVerified) return 1;
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });
  }, [cloudPosts, activeTab, activeTimeline]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollY = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      const index = Math.round(scrollY / height);
      if (index !== activeVideoIndex) setActiveVideoIndex(index);
    }
  };

  const commentingPost = useMemo(
    () => cloudPosts.find(p => p.id === commentingPostId) || null,
    [cloudPosts, commentingPostId]
  );

  if (!currentUser) return <LandingPage onJoin={handleJoin} />;

  const isVerified = currentUser.role === 'verified' || currentUser.role === 'admin';

  return (
    <div className={`fixed inset-0 flex justify-center select-none transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
      <div className={`relative w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black border-x border-white/5' : 'bg-white border-x border-gray-200'}`}>
        
        {/* Notification Toast */}
        {activeNotification && (
          <NotificationToast 
            notification={activeNotification} 
            onClose={() => setActiveNotification(null)}
            onClick={(n) => {
              if (n.type === 'offer') setActiveTab('profile');
              if (n.type === 'event') setActiveTab('events');
              setActiveNotification(null);
            }}
          />
        )}

        {/* Main Header */}
        {!viewingProfileId && (
          <header className={`absolute top-0 left-0 w-full z-40 bg-gradient-to-b ${theme === 'dark' ? 'from-black/90 via-black/50 to-transparent' : 'from-white/90 via-white/50 to-transparent'}`}>
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="font-bungee text-2xl tracking-tighter cursor-pointer" onClick={() => setActiveTab('feed')}>
                <span className="text-[#ff00ff]">RAVE</span><span className="text-[#00ffff]">TOK</span>
              </h1>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                  className={`p-2 glass-panel rounded-full transition-all ${theme === 'dark' ? 'text-yellow-400' : 'text-indigo-600 border-gray-200 bg-gray-100'}`}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {!currentUser.isVerified && (
                  <button onClick={() => setShowUpgradeModal(true)} className="p-2 glass-panel rounded-full text-yellow-500 animate-pulse transition-all">
                    <Key size={16} />
                  </button>
                )}
                <button onClick={() => setIsMuted(!isMuted)} className={`p-2 glass-panel rounded-full transition-all ${!isMuted ? 'text-[#39ff14] border-[#39ff14]/50' : (theme === 'dark' ? 'text-white/60' : 'text-gray-400')}`}>
                  <Radio size={16} className={!isMuted ? "animate-pulse" : ""} />
                </button>
              </div>
            </div>

            {/* Top Sub-Nav (Timeline Filters) */}
            {activeTab === 'feed' && (
              <div className="flex items-center justify-center gap-2 pb-3 px-4 animate-in slide-in-from-top-2 duration-300">
                {[
                  { id: 'all', label: 'ALL', icon: <Zap size={10} /> },
                  { id: '90s', label: '90s', icon: <Clock size={10} /> },
                  { id: 'jungle', label: 'JUNGLE', icon: <Wind size={10} /> },
                  { id: 'vinyl', label: 'VINYL', icon: <Disc size={10} /> }
                ].map((tl) => (
                  <button 
                    key={tl.id}
                    onClick={() => { setActiveTimeline(tl.id as any); setActiveVideoIndex(0); containerRef.current?.scrollTo(0,0); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                      activeTimeline === tl.id 
                        ? (theme === 'dark' ? 'bg-white text-black border-white shadow-[0_0_10px_white]' : 'bg-black text-white border-black shadow-[0_0_10px_rgba(0,0,0,0.3)]')
                        : (theme === 'dark' ? 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30' : 'bg-white/40 text-gray-500 border-gray-200 hover:border-gray-400')
                    }`}
                  >
                    {tl.icon}
                    {tl.label}
                  </button>
                ))}
              </div>
            )}
          </header>
        )}

        {viewingProfileId && (
          <button onClick={() => setViewingProfileId(null)} className={`absolute top-4 left-4 z-[60] p-2 backdrop-blur-md rounded-full border transition-all active:scale-90 ${theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-black'}`}>
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0 relative">
          {viewingProfileId ? (
            <ProfileView 
              user={cloudPosts.find(p => p.userId === viewingProfileId)?.user || MOCK_USER} 
              isCurrentUser={viewingProfileId === currentUser.id} 
              isFollowing={followingIds.has(viewingProfileId)} 
              userPosts={cloudPosts.filter(p => p.userId === viewingProfileId)} 
              userCrate={[]} 
              offers={offers} 
              onFollow={() => handleFollow(viewingProfileId)} 
              onEditProfile={() => {}} 
              onPostClick={(p) => { setViewingProfileId(null); setActiveTab('feed'); setActiveVideoIndex(filteredPosts.findIndex(fp => fp.id === p.id)); }} 
              onUpdateOffer={() => {}} 
            />
          ) : (
            <>
              {activeTab === 'feed' && (
                <div ref={containerRef} onScroll={handleScroll} className="flex-1 snap-container no-scrollbar overflow-y-auto">
                  {filteredPosts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                      <Disc size={64} className="text-zinc-800 mb-4 animate-spin-slow" />
                      <p className={`font-bungee ${theme === 'dark' ? 'text-[#ff00ff]' : 'text-black'}`}>NO SIGNALS</p>
                    </div>
                  ) : (
                    filteredPosts.map((post, index) => (
                      <VideoCard 
                        key={post.id} 
                        post={post} 
                        isActive={activeVideoIndex === index} 
                        isMuted={isMuted} 
                        isUserLiked={!!userLikedPosts[post.id]} 
                        isInCrate={localLibrary.some(t => t.id === post.id)}
                        onLike={() => handleLike(post.id)} 
                        onComment={() => setCommentingPostId(post.id)} 
                        onShare={() => {}} 
                        onAddToCrate={() => handleToggleCrate(post)} 
                        onPlayYoutube={() => {}} 
                        onProfileClick={() => setViewingProfileId(post.userId)} 
                      />
                    ))
                  )}
                </div>
              )}
              
              {activeTab === 'library' && (
                <Library 
                  tracks={localLibrary} 
                  onPostToFeed={(track) => {
                    const post: Post = {
                      id: `post-${Date.now()}`,
                      userId: currentUser.id,
                      user: currentUser,
                      trackTitle: track.title,
                      artist: track.artist,
                      audioUrl: track.previewUrl,
                      thumbnail: track.artwork,
                      description: `Ripping this absolute plate from the archive! #vinyl #${track.genre.toLowerCase()}`,
                      likes: 0, reposts: 0, shares: 0, comments: [],
                      source: 'library',
                      categories: [track.genre.toLowerCase(), 'vinyl'],
                      metadata: { year: track.year, genre: track.genre, type: 'vinyl' },
                      year: track.year, genre: track.genre, label: track.label,
                      createdAt: new Date().toISOString()
                    };
                    setCloudPosts(prev => [post, ...prev]);
                    setActiveTab('feed');
                  }} 
                />
              )}

              {activeTab === 'market' && <Marketplace posts={cloudPosts} currentUser={currentUser} offers={offers} onMakeOffer={(off) => {
                setOffers(prev => [{ ...off, id: `offer-${Date.now()}`, fromUserId: currentUser.id, fromUsername: currentUser.username, status: 'pending', timestamp: new Date().toISOString() } as Offer, ...prev]);
                // Simulating notification for the recipient
                triggerNotification("NEW OFFER RECEIVED", `User @${currentUser.username} offered £${off.amount} for your item!`, "offer");
              }} />}
              
              {activeTab === 'events' && (
                <EventsView 
                  posts={cloudPosts} 
                  currentUser={currentUser} 
                  onSponsor={(post) => {
                    setCloudPosts(prev => [post, ...prev]);
                    alert("TRANSMISSION RECEIVED. EVENT PENDING ADMIN SYNC.");
                  }}
                  onViewPost={(p) => { setActiveTab('feed'); setActiveVideoIndex(filteredPosts.findIndex(fp => fp.id === p.id)); }}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView 
                  user={currentUser} 
                  isCurrentUser={true} 
                  isFollowing={false} 
                  userPosts={cloudPosts.filter(p => p.userId === currentUser.id)} 
                  userCrate={localLibrary} 
                  offers={offers} 
                  onFollow={() => {}} 
                  onEditProfile={(upd) => setCurrentUser(prev => prev ? { ...prev, ...upd } : null)} 
                  onPostClick={(p) => { setActiveTab('feed'); setActiveVideoIndex(filteredPosts.findIndex(fp => fp.id === p.id)); }} 
                  onUpdateOffer={(id, status) => setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o))} 
                />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard 
                  currentUser={currentUser} 
                  posts={cloudPosts} 
                  inviteCodes={inviteCodes} 
                  onAddPost={(p) => { setCloudPosts(prev => [p, ...prev]); setActiveTab('feed'); }} 
                  onDeletePost={(id) => setCloudPosts(prev => prev.filter(p => p.id !== id))} 
                  onUpdatePost={(post) => {
                    setCloudPosts(prev => prev.map(p => p.id === post.id ? post : p));
                    if (post.metadata.type === 'event' && post.metadata.eventStatus === 'approved') {
                      triggerNotification("EVENT APPROVED", `${post.trackTitle} has been authorized for broadcast.`, "event");
                    }
                  }}
                  onGenerateCode={() => {
                    const code = `DJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    setInviteCodes(prev => [{ code, createdBy: currentUser.id, createdAt: new Date().toISOString() }, ...prev]);
                  }} 
                />
              )}
            </>
          )}
        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className={`absolute bottom-0 w-full h-20 backdrop-blur-md border-t flex items-center justify-around px-2 z-50 transition-colors duration-300 ${theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white/95 border-gray-200'}`}>
          <button 
            onClick={() => { setActiveTab('feed'); setViewingProfileId(null); }} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'feed' && !viewingProfileId ? (theme === 'dark' ? 'text-white' : 'text-black') : 'text-gray-500'}`}
          >
            <Home size={18} />
            <span className="text-[7px] font-black tracking-widest">FEED</span>
          </button>

          <button 
            onClick={() => { setActiveTab('library'); setViewingProfileId(null); }} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'library' ? (theme === 'dark' ? 'text-white' : 'text-black') : 'text-gray-500'}`}
          >
            <Disc size={18} />
            <span className="text-[7px] font-black tracking-widest">CRATE</span>
          </button>

          <button 
            onClick={() => { setActiveTab('events'); setViewingProfileId(null); }} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'events' ? 'text-[#00ffff]' : 'text-gray-500'}`}
          >
            <Calendar size={18} />
            <span className="text-[7px] font-black tracking-widest">EVENTS</span>
          </button>

          <button 
            onClick={() => { setActiveTab('admin'); setViewingProfileId(null); }} 
            className={`mb-6 w-12 h-12 bg-gradient-to-br from-[#ff00ff] to-[#00ffff] rounded-2xl flex items-center justify-center text-black shadow-lg transition-all active:scale-90 border-2 border-black ${!isVerified ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            <PlusSquare size={24} />
          </button>

          <button 
            onClick={() => { setActiveTab('market'); setViewingProfileId(null); }} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'market' ? 'text-[#39ff14]' : 'text-gray-500'}`}
          >
            <ShoppingBag size={18} />
            <span className="text-[7px] font-black tracking-widest">MARKET</span>
          </button>

          <button 
            onClick={() => { setActiveTab('profile'); setViewingProfileId(null); }} 
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === 'profile' ? (theme === 'dark' ? 'text-white' : 'text-black') : 'text-gray-500'}`}
          >
            <UserIcon size={18} />
            <span className="text-[7px] font-black tracking-widest">YOU</span>
          </button>
        </nav>

        {/* Comments Modal */}
        {commentingPost && (
          <CommentsModal
            comments={commentingPost.comments}
            currentUser={currentUser}
            onAddComment={(text) => handleAddComment(commentingPost.id, text)}
            onClose={() => setCommentingPostId(null)}
          />
        )}

        {/* UI Modals */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className={`absolute inset-0 backdrop-blur-lg ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'}`} onClick={() => setShowUpgradeModal(false)} />
            <div className={`relative w-full max-w-sm glass-panel p-8 rounded-[2.5rem] border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-in zoom-in-95 duration-200 ${theme === 'light' ? 'bg-white' : ''}`}>
              <h3 className="font-bungee text-2xl text-yellow-500 text-center mb-6 uppercase tracking-tighter">VERIFY DJ NODE</h3>
              <input 
                type="text" value={upgradeCode} onChange={(e) => setUpgradeCode(e.target.value.toUpperCase())}
                placeholder="INVITATION CODE" className={`w-full border rounded-xl px-4 py-4 text-center font-bungee text-xl text-yellow-500 mb-6 placeholder:text-gray-400 outline-none ${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
              />
              <button onClick={() => handleUpgrade()} className="w-full bg-yellow-500 text-black font-bungee py-4 rounded-xl shadow-[0_10px_30px_rgba(234,179,8,0.3)] active:scale-95 transition-all">CONNECT NODE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
