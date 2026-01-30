
import React, { useState, useEffect, useRef } from 'react';
import { Comment, User } from '../types';
import { X, Send } from 'lucide-react';

interface CommentsModalProps {
  comments: Comment[];
  currentUser: User;
  onAddComment: (text: string) => void;
  onClose: () => void;
}

const getTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const CommentsModal: React.FC<CommentsModalProps> = ({ comments, currentUser, onAddComment, onClose }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus when modal opens
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddComment(text.trim());
      setText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0a0a0a] rounded-t-[2.5rem] border-t-4 border-[#ff00ff] h-[75vh] flex flex-col p-6 animate-slide-up shadow-[0_-10px_40px_rgba(255,0,255,0.2)]">
        {/* Handle bar for visual cue */}
        <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 flex-shrink-0" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="font-bungee text-2xl text-[#ff00ff] neon-text-pink leading-none">REPLIES</h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{comments.length} VIBES DETECTED</span>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-900 rounded-full text-white hover:bg-gray-800 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-700 opacity-50">
              <MessageCircle size={48} className="mb-4" />
              <p className="font-bungee text-sm uppercase tracking-widest italic">Signal quiet...</p>
              <p className="text-[10px] mt-2">BE THE FIRST TO DROP A VIBE</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-4 group">
                <div className="relative flex-shrink-0">
                  <img src={c.userAvatar} className="w-12 h-12 rounded-full border-2 border-gray-800 object-cover" alt={c.username} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39ff14] rounded-full border-2 border-black" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00ffff] tracking-tight group-hover:neon-text-cyan transition-all">@{c.username}</span>
                    <span className="text-[9px] text-gray-600 font-mono uppercase">{getTimeAgo(c.timestamp)}</span>
                  </div>
                  <div className="bg-gray-900/50 rounded-2xl p-3 mt-1.5 border border-white/5 group-hover:border-white/10 transition-all">
                    <p className="text-sm leading-relaxed text-gray-300">{c.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-3 border-t border-white/5 pt-6 pb-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Drop a vibe..."
              className="w-full bg-gray-900/80 border border-gray-800 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff]/30 transition-all font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-600">
               <span className="text-[10px] font-bold">↵</span>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!text.trim()} 
            className="bg-[#ff00ff] text-white p-3.5 rounded-full disabled:opacity-20 shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:scale-110 active:scale-95 transition-all"
          >
            <Send size={22} fill="currentColor" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const MessageCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export default CommentsModal;
