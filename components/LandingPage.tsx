
import React, { useState } from 'react';
import { Key, User, Lock, Loader2 } from 'lucide-react';

interface LandingPageProps {
  onJoin: (email: string, handle: string, isAdmin: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onJoin }) => {
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginView && !handle)) return;

    setIsLoading(true);
    
    // Simulate auth latency for that "connecting to node" feel
    setTimeout(() => {
      // ✅ ADMIN OVERRIDE CHECK
      // Using 'admin' as the password as per the marketplace prompt hint
      const isAdmin = email.toLowerCase() === 'ravetok@test.com' && password === 'admin';
      
      // If logging in, derive handle from email if not provided
      const userHandle = isLoginView ? (isAdmin ? 'ADMIN' : email.split('@')[0]) : handle;
      
      onJoin(email, userHandle, isAdmin);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-[#000] flex flex-col items-center justify-center p-6 z-[100] overflow-hidden">
      {/* Background Glitch Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff00ff] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ffff] blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="text-center space-y-6 max-w-sm w-full relative z-10">
        <div className="space-y-0 mb-10">
          <h1 className="font-bungee text-7xl text-[#ff00ff] tracking-tighter neon-text-pink leading-[0.8] mb-1">RAVE</h1>
          <h1 className="font-bungee text-7xl text-[#00ffff] tracking-tighter neon-text-cyan leading-[0.8]">TOK</h1>
          <p className="text-[#39ff14] font-black tracking-[0.3em] text-[10px] uppercase mt-4 animate-pulse">
            TRANSMISSION SECURED
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">ENCRYPTED ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ffff] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ffff] transition-all font-bold tracking-wider placeholder:text-gray-700"
                  required
                />
              </div>
            </div>

            {!isLoginView && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">NETWORK HANDLE</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#39ff14] transition-colors font-bold">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="HANDLE"
                    className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#39ff14] transition-all font-bold tracking-wider placeholder:text-gray-700"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">SECURITY KEY</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff00ff] transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#ff00ff] transition-all font-bold tracking-wider placeholder:text-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white font-bungee py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,0,255,0.3)] flex items-center justify-center gap-3 mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Key size={18} />
                {isLoginView ? 'SYNC CONNECTION' : 'INITIALIZE NODE'}
              </>
            )}
          </button>
          
          <div className="pt-4">
            <button 
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {isLoginView ? 'New to the network? Register node' : 'Existing account? Re-sync'}
            </button>
          </div>
        </form>

        <div className="pt-10 flex flex-col items-center gap-2">
          <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
             <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bungee text-[10px]">91</div>
             <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bungee text-[10px]">93</div>
             <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bungee text-[10px]">95</div>
          </div>
          <p className="text-gray-700 text-[8px] uppercase tracking-[0.4em] font-black">
            End-to-End Encryption • Dublin Signal 153.2
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
