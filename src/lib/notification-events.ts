import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, NotificationType } from './supabase/types';
import { isUuid } from './social';

type CreateNotificationParams = {
  recipientId?: string | null;
  actorId?: string | null;
  type: NotificationType;
  postId?: string | null;
  remixPostId?: string | null;
};

export async function createNotification(
  supabase: SupabaseClient<Database>,
  params: CreateNotificationParams,
) {
  const recipientId = params.recipientId ?? '';
  const actorId = params.actorId ?? null;

  if (!isUuid(recipientId)) return;
  if (actorId && recipientId === actorId) return;

  await supabase.from('notifications').insert({
    recipient_id: recipientId,
    type: params.type,
    actor_id: actorId && isUuid(actorId) ? actorId : null,
    post_id: params.postId && isUuid(params.postId) ? params.postId : null,
    remix_post_id: params.remixPostId && isUuid(params.remixPostId) ? params.remixPostId : null,
  } as never);
}
