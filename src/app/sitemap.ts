import { MetadataRoute } from 'next'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

  // Get all published notes
  const { data: notes } = await supabaseServer
    .from('notes')
    .select('id, created_at, updated_at')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const noteUrls = notes?.map((note) => ({
    url: `${baseUrl}/notes/${note.id}`,
    lastModified: new Date(note.updated_at || note.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...noteUrls,
  ];
}