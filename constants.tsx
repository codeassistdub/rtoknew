
import { Post, User, LibraryTrack } from './types';

export const COLORS = {
  pink: "#ff00ff",
  cyan: "#00ffff",
  neonGreen: "#39ff14",
  black: "#050505",
};

export const RAVE_FALLBACKS: Record<string, string> = {
  'Igw4qfW8qag': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'X_8vH6pW5n8': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
};

export const MOCK_USER: User = {
  id: "user-default-1",
  username: "rave_legend_94",
  displayName: "DJ Slipstream",
  avatar: "https://picsum.photos/seed/slipstream/200",
  role: "dj",
  followers: 1204,
  following: 85,
  bio: "Resident at The Sanctuary. Jungle is massive.",
  themeColor: COLORS.cyan
};

export const SEED_POSTS: Post[] = [
  {
    id: "post-1",
    createdAt: "2024-01-01T12:00:00.000Z",
    userId: MOCK_USER.id,
    user: MOCK_USER,
    trackTitle: "Original Nuttah",
    artist: "UK Apachi & Shy FX",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/seed/nuttah/600/1000",
    description: "The ultimate 94 anthem. Soundboy buried! #jungle #dnb #classic",
    likes: 5400,
    reposts: 230,
    shares: 45,
    comments: [],
    source: "library",
    categories: ["90s", "global"],
    metadata: {
      year: "1994",
      genre: "Jungle",
      type: "single"
    },
    year: "1994",
    label: "SOUR",
    genre: "Jungle"
  },
  {
    id: "post-2",
    createdAt: "2024-01-02T12:00:00.000Z",
    userId: "u2",
    user: { ...MOCK_USER, id: "u2", username: "vinyl_junkie", avatar: "https://picsum.photos/seed/vinyl/200" },
    trackTitle: "Valley of the Shadows",
    artist: "Origin Unknown",
    youtubeId: "Igw4qfW8qag",
    thumbnail: "https://img.youtube.com/vi/Igw4qfW8qag/maxresdefault.jpg",
    description: "Mint copy found in a basement. 1993 RAM classic. #vinyl #ramrecords",
    likes: 8200,
    reposts: 450,
    shares: 89,
    comments: [],
    source: "youtube",
    categories: ["90s", "vinyl", "global"],
    metadata: {
      year: "1993",
      genre: "Jungle",
      type: "vinyl",
      condition: "NM",
      price: "45"
    },
    year: "1993",
    label: "RAM Records",
    genre: "Jungle",
    vinyl: {
      condition: "NM",
      price: "45",
      isForSale: true
    },
    links: {
      youtube: "https://youtu.be/Igw4qfW8qag",
      discogs: "https://www.discogs.com/master/12345"
    }
  },
  {
    id: "post-3",
    createdAt: "2024-01-03T12:00:00.000Z",
    userId: "u3",
    user: { ...MOCK_USER, id: "u3", username: "mix_master", avatar: "https://picsum.photos/seed/mix/200" },
    trackTitle: "Live at Helter Skelter 95",
    artist: "DJ Sy",
    youtubeId: "X_8vH6pW5n8",
    thumbnail: "https://picsum.photos/seed/rave95/600/1000",
    description: "Pure euphoria. The scratch master at work. #happyhardcore #95rave",
    likes: 12000,
    reposts: 800,
    shares: 120,
    comments: [],
    source: "youtube",
    categories: ["mixes", "90s", "global"],
    metadata: {
      year: "1995",
      genre: "Hardcore",
      type: "mix"
    },
    year: "1995",
    label: "Helter Skelter",
    genre: "Hardcore",
    isMix: true,
    duration: "65:00"
  }
];

export const INITIAL_LIBRARY: LibraryTrack[] = [
  {
    id: "track-1",
    title: "The Chopper",
    artist: "Ray Keith",
    label: "V Recordings",
    year: "1994",
    genre: "Jungle",
    artwork: "https://picsum.photos/seed/chopper/400",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    verified: true
  }
];
