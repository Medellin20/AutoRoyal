import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'

type SeoInput = {
  title: string
  description?: string
  path?: string
  image?: string
}

export function buildMetadata({ title, description, path = '/', image }: SeoInput): Metadata {
  const url = `${siteConfig.url}${path}`
  const desc = description ?? siteConfig.description
  const ogImage = image ?? `${siteConfig.url}${siteConfig.logo}`

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [
        image
          ? { url: ogImage, alt: title }
          : { url: ogImage, width: 1272, height: 530, alt: title },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  }
}
