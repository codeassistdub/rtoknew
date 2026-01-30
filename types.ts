
export type UserRole = "fan" | "dj" | "label" | "admin" | "raver" | "resident" | "verified" | "user";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: UserRole;
  followers: number;
  following: number;
  bio?: string;
  banner?: string;
  themeColor?: string;
  postCount?: number;
  totalLikes?: number;
  isVerified?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export type PostSource = "upload" | "library" | "live" | "youtube" | "marketplace" | "external" | "event";
export type RaveCategory = "90s" | "mixes" | "year" | "vinyl" | "global" | "jungle" | "hardcore" | "techno" | "events";
export type MarketCategory = "Vinyl" | "Decks" | "Tape Packs" | "Studio Gear";

export interface Offer {
  id: string;
  postId: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  amount: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  timestamp: string;
}

export interface PostMetadata {
  year?: string;
  genre?: string;
  type?: 'vinyl' | 'mix' | 'single' | 'live' | 'gear' | 'event';
  condition?: string;
  price?: string;
  guestTags?: string[];
  marketCategory?: MarketCategory;
  eventStatus?: 'pending' | 'approved' | 'rejected';
  ticketUrl?: string;
  isSponsored?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  trackTitle: string;
  artist: string;
  videoUrl?: string;
  audioUrl?: string;
  youtubeId?: string;
  thumbnail?: string;
  images?: string[]; 
  description: string;
  likes: number;
  reposts: number;
  shares: number;
  comments: Comment[];
  source: PostSource;
  categories: string[]; 
  metadata: PostMetadata;
  createdAt?: string;
  year?: string;
  label?: string;
  genre?: string;
  tags?: string[];
  isMix?: boolean;
  isLive?: boolean;
  watchCount?: number;
  duration?: string;
  externalUrl?: string;
  price?: string;
  status?: 'active' | 'sold';
  links?: {
    youtube?: string;
    spotify?: string;
    discogs?: string;
  };
  vinyl?: {
    condition: string;
    price: string;
    isForSale: boolean;
  };
  embedHtml?: string;
}

export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  label: string;
  year: string;
  genre: string;
  artwork: string;
  previewUrl: string;
  verified: boolean;
  isMix?: boolean;
  duration?: string;
}

export interface InviteCode {
  code: string;
  createdBy: string;
  usedBy?: string;
  createdAt: string;
}
