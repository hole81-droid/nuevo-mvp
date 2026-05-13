export type PartnerTier = 'seedling' | 'growth' | 'pro' | 'champion';
export type ContentType = 'interactive' | 'audio' | 'image';
export type NotificationType =
  | 'remix' | 'like' | 'follow' | 'comment' | 'reaction'
  | 'revenue' | 'tier_up' | 'remix_revenue';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          handle: string;
          display_name: string;
          avatar_emoji: string;
          avatar_bg: string;
          bio: string | null;
          partner_tier: PartnerTier | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          handle: string;
          display_name: string;
          avatar_emoji?: string;
          avatar_bg?: string;
          bio?: string | null;
          partner_tier?: PartnerTier | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          handle?: string;
          display_name?: string;
          avatar_emoji?: string;
          avatar_bg?: string;
          bio?: string | null;
          partner_tier?: PartnerTier | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          text: string;
          content_type: ContentType;
          iframe_url: string | null;
          cover_emoji: string | null;
          bg_gradient: string;
          remixable: boolean;
          remix_of: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          text?: string;
          content_type: ContentType;
          iframe_url?: string | null;
          cover_emoji?: string | null;
          bg_gradient?: string;
          remixable?: boolean;
          remix_of?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          text?: string;
          content_type?: ContentType;
          iframe_url?: string | null;
          cover_emoji?: string | null;
          bg_gradient?: string;
          remixable?: boolean;
          remix_of?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: NotificationType;
          actor_id: string | null;
          post_id: string | null;
          remix_post_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: NotificationType;
          actor_id?: string | null;
          post_id?: string | null;
          remix_post_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          type?: NotificationType;
          actor_id?: string | null;
          post_id?: string | null;
          remix_post_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      experience_events: {
        Row: {
          id: string;
          post_id: string;
          viewer_id: string | null;
          client_session_id: string;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          viewer_id?: string | null;
          client_session_id: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          viewer_id?: string | null;
          client_session_id?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type PostRow = Database['public']['Tables']['posts']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type ExperienceEventRow = Database['public']['Tables']['experience_events']['Row'];

// PostRow with joined author
export type PostWithAuthor = PostRow & { author: UserRow };
