import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '', '/vehicules', '/reservation', '/demande-achat', '/services',
    '/a-propos', '/faq', '/contact', '/conditions-location',
    '/politique-confidentialite', '/mentions-legales',
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  let vehicles = [] as { slug: string; updatedAt: Date }[]
  try {
    vehicles = await prisma.vehicle.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })
  } catch (e) {
    // If Prisma cannot connect (e.g. during a local build without DATABASE_URL),
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
