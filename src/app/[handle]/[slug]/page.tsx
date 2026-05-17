import { redirect, notFound } from 'next/navigation';
import { extractPostIdFromCreatorSlug } from '@/lib/deep-link';

interface Props {
  params: Promise<{ handle: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function queryString(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (typeof value === 'string') {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export default async function CreatorPostRedirectPage({ params, searchParams }: Props) {
  const { handle, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const decodedHandle = decodeURIComponent(handle);

  if (!decodedHandle.startsWith('@')) notFound();

  const postId = extractPostIdFromCreatorSlug(slug);
  if (!postId) notFound();

  redirect(`/post/${encodeURIComponent(postId)}${queryString(resolvedSearchParams)}`);
}
