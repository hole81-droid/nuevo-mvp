export type ContentType = 'interactive' | 'audio' | 'image';

export type PartnerTier = 'seedling' | 'growth' | 'pro' | 'champion';

export interface Author {
  id: string;
  displayName: string;
  handle: string;
  avatarEmoji: string;
  avatarBg: string;
  followerCount: number;
  bio?: string;
  partnerTier?: PartnerTier;
}

export interface Post {
  id: string;
  author: Author;
  createdAt: string;
  text: string;
  contentType: ContentType;
  title: string;
  media: {
    emoji?: string;
    iframeUrl?: string;
    coverEmoji?: string;
    imageCount?: number;
    bgGradient?: string;
  };
  stats: {
    replies: number;
    reposts: number;
    likes: number;
    views: number;
    saves?: number;
    shares?: number;
    experienceSessions: number;
    experienceMinutes: number;
  };
  reactions: {
    funny: number;
    weird: number;
    genius: number;
    wtf: number;
  };
  tags?: string[];
  externalLinks?: ExternalLink[];
  tool?: string;
  remixable?: boolean;
  detailDescription?: string;
  remixOf?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface Comment {
  id: string;
  author: Author;
  text: string;
  createdAt: string;
  likes: number;
}

export type UploadStep = 1 | 2 | 3;

export interface UploadFormData {
  contentType: ContentType | null;
  title: string;
  description: string;
  thumbnail: File | null;
  iframeUrl: string;
  audioFile: File | null;
  images: File[];
  detailedDescription: string;
  tool: string;
  tags: string;
  externalLinks: ExternalLink[];
  remixable: boolean;
  promptPublic: boolean;
  remixOf: string;
}
