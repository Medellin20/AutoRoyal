/**
 * Fichier central de personnalisation.
 * Modifier ici : nom, logo, couleurs, coordonnees et reseaux sociaux.
 */
export const siteConfig = {
  name: 'Laurent Crash Autos',
  legalName: 'Laurent Crash Autos',
  tagline: 'Louez ou achetez votre prochaine voiture, sans mauvaise surprise.',
  description:
    "Laurent Crash Autos loue et vend des vehicules controles, livres propres, avec des tarifs affiches et un contrat clair.",
  logo: '/images/laurent-crash-autos.png',
  logoLight: '/images/laurent-crash-autos.png',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'fr_FR',
  currency: 'EUR',
  currencyLabel: '€',

  contact: {
    phone: '', // a renseigner avec le numero francais de l entreprise
    whatsapp: '', // indicatif francais +33, sans + ni espaces
    email: 'contact@autoroyal.com',
    address: 'France metropolitaine',
    hours: 'Lundi au samedi, 8h - 19h',
    mapEmbed:
      'https://www.google.com/maps?q=France&output=embed',
  },

  social: {
    facebook: 'https://facebook.com/autoroyal',
    instagram: 'https://instagram.com/autoroyal',
    tiktok: 'https://tiktok.com/@autoroyal',
    linkedin: 'https://linkedin.com/company/autoroyal',
  },

  /** Palette Laurent Crash Autos : rouge, noir et argent. */
  theme: {
    accent: '237 28 36',
    accentSoft: '255 235 236',
    gold: '164 169 173',
    ink: '24 24 26',
    muted: '105 108 112',
    canvas: '255 255 255',
    surface: '247 247 247',
    line: '222 224 226',
  },

  booking: {
    minDays: 1,
    maxDays: 90,
    /** Frais de dossier appliques a chaque location. */
    serviceFee: 8,
    /** Frais forfaitaires si le lieu de retour differe du lieu de retrait. */
    differentReturnFee: 15,
    pickupPlaces: [
      'Lieu convenu en France metropolitaine',
      'Autre lieu en France metropolitaine',
    ],
  },
} as const

export type SiteConfig = typeof siteConfig
