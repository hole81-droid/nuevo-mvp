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
      payout_requests: {
        Row: {
          id: string;
          creator_id: string;
          month: string;
          amount_krw: number;
          status: 'requested' | 'reviewing' | 'approved' | 'paid' | 'rejected';
          requested_at: string;
          processed_at: string | null;
          rejection_reason: string | null;
        };
        Insert: {
          id?: string;
          creator_id: string;
          month: string;
          amount_krw: number;
          status?: 'requested' | 'reviewing' | 'approved' | 'paid' | 'rejected';
          requested_at?: string;
          processed_at?: string | null;
          rejection_reason?: string | null;
        };
        Update: {
          id?: string;
          creator_id?: string;
          month?: string;
          amount_krw?: number;
          status?: 'requested' | 'reviewing' | 'approved' | 'paid' | 'rejected';
          requested_at?: string;
          processed_at?: string | null;
          rejection_reason?: string | null;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          text?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_reactions: {
        Row: {
          post_id: string;
          user_id: string;
          reaction: 'funny' | 'weird' | 'genius' | 'wtf';
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          reaction: 'funny' | 'weird' | 'genius' | 'wtf';
          created_at?: string;
        };
        Update: {
          post_id?: string;
          user_id?: string;
          reaction?: 'funny' | 'weird' | 'genius' | 'wtf';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      post_monthly_wes: {
        Row: {
          post_id: string;
          author_id: string;
          title: string;
          content_type: ContentType;
          month: string;
          sessions: number;
          minutes: number;
          reactions: number;
          comments: number;
          remixes: number;
          wes: number;
        };
      };
      creator_monthly_wes: {
        Row: {
          author_id: string;
          month: string;
          sessions: number;
          minutes: number;
          reactions: number;
          comments: number;
          remixes: number;
          wes: number;
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
export type PayoutRequestRow = Database['public']['Tables']['payout_requests']['Row'];
export type FollowRow = Database['public']['Tables']['follows']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type PostReactionRow = Database['public']['Tables']['post_reactions']['Row'];
export type PostMonthlyWesRow = Database['public']['Views']['post_monthly_wes']['Row'];
export type CreatorMonthlyWesRow = Database['public']['Views']['creator_monthly_wes']['Row'];

// PostRow with joined author
export type PostWithAuthor = PostRow & { author: UserRow };
