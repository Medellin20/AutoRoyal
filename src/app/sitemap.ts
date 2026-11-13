import type { MetadataRoute } from 'next'
import { getSupabasePublic } from '@/lib/supabase'
import { siteConfig } from '@/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '', '/vehicules', '/demande-achat', '/services',
    '/a-propos', '/faq', '/contact',
    '/politique-confidentialite', '/mentions-legales',
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  let vehicles = [] as { slug: string; updatedAt: Date }[]
  try {
    const { data, error } = await getSupabasePublic().from('vehicles').select('slug,updatedAt').eq('published', true)
    if (error) throw error
    vehicles = (data ?? []) as { slug: string; updatedAt: Date }[]
  } catch (e) {
    // If Supabase is not configured during a local build,
    // fall back to returning only the static routes so the build can proceed.
    // The sitemap will be more complete at runtime when a database is available.
    // eslint-disable-next-line no-console
    console.warn('Could not fetch vehicles for sitemap:', (e as Error).message)
  }

  return [
    ...staticRoutes,
    ...vehicles.map((v) => ({
      url: `${siteConfig.url}/vehicules/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ]
}
