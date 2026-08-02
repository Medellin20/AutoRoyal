/**
 * Fichier central de personnalisation.
 * Modifier ici : nom, logo, couleurs, coordonnees et reseaux sociaux.
 */
export const siteConfig = {
  name: 'AutoRoyal',
  legalName: 'AutoRoyal SARL',
  tagline: 'Louez ou achetez votre prochaine voiture, sans mauvaise surprise.',
  description:
    "AutoRoyal loue et vend des vehicules controles, livres propres, avec des tarifs affiches et un contrat clair.",
  logo: '/images/logo.svg',
  logoLight: '/images/logo.svg',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'fr_FR',
  currency: 'XOF',
  currencyLabel: 'FCFA',

  contact: {
    phone: '+229 01 97 00 00 00',
    whatsapp: '2290197000000', // format international, sans + ni espaces
    email: 'contact@autoroyal.com',
    address: 'Carrefour Tankpe, Abomey-Calavi, Benin',
    hours: 'Lundi au samedi, 8h - 19h',
    mapEmbed:
      'https://www.google.com/maps?q=Abomey-Calavi,Benin&output=embed',
  },

  social: {
    facebook: 'https://facebook.com/autoroyal',
    instagram: 'https://instagram.com/autoroyal',
    tiktok: 'https://tiktok.com/@autoroyal',
    linkedin: 'https://linkedin.com/company/autoroyal',
  },

  /** Palette claire. Modifier l'accent suffit a rehabiller le site. */
  theme: {
    accent: '47 91 234', // bleu royal - rgb sans virgules
    accentSoft: '234 240 255',
    gold: '198 154 58',
    ink: '20 32 58',
    muted: '104 116 140',
    canvas: '255 255 255',
    surface: '246 248 252',
    line: '226 232 240',
  },

  booking: {
    minDays: 1,
    maxDays: 90,
    /** Frais de dossier appliques a chaque location. */
    serviceFee: 5000,
    /** Frais forfaitaires si le lieu de retour differe du lieu de retrait. */
    differentReturnFee: 10000,
    pickupPlaces: [
      'Agence Abomey-Calavi',
      'Agence Cotonou Ganhi',
      'Aeroport Cardinal Bernardin Gantin',
      'Livraison a domicile',
    ],
  },
} as const

export type SiteConfig = typeof siteConfig
