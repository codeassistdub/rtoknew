
import React from 'react';
import { AppNotification } from '../types';
import { ShoppingBag, Calendar, Zap, X } from 'lucide-react';

interface NotificationToastProps {
  notification: AppNotification;
  onClose: (id: string) => void;
  onClick: (notification: AppNotification) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, onClick }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'offer': return <ShoppingBag className="text-[#39ff14]" />;
      case 'event': return <Calendar className="text-[#00ffff]" />;
      default: return <Zap className="text-[#ff00ff]" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'offer': return 'border-[#39ff14]/50 shadow-[0_0_20px_rgba(57,255,20,0.3)]';
      case 'event': return 'border-[#00ffff]/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]';
      default: return 'border-[#ff00ff]/50 shadow-[0_0_20px_rgba(255,0,255,0.3)]';
    }
  };

  return (
    <div 
      onClick={() => onClick(notification)}
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[200] glass-panel p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer animate-in slide-in-from-top-full duration-500 ${getBorderColor()}`}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bungee text-[10px] uppercase tracking-tighter truncate leading-tight">
          {notification.title}
        </h4>
        <p className="text-[11px] text-gray-300 font-medium line-clamp-1">
          {notification.message}
        </p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(notification.id); }}
        className="p-1 hover:bg-white/10 rounded-full text-gray-500 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default NotificationToast;
