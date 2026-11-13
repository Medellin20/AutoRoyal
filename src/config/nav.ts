export const mainNav = [
  { label: 'Accueil', href: '/' },
  { label: 'Vehicules', href: '/vehicules' },
  { label: 'Services', href: '/services' },
  { label: 'A propos', href: '/a-propos' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export const footerNav = {
  offre: [
    { label: 'Véhicules accidentés', href: '/vehicules' },
    { label: 'Commander un véhicule', href: '/demande-achat' },
  ],
  garage: [
    { label: 'A propos', href: '/a-propos' },
    { label: 'Services', href: '/services' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Politique de confidentialite', href: '/politique-confidentialite' },
    { label: 'Mentions legales', href: '/mentions-legales' },
  ],
}

export const adminNav = [
  { label: 'Tableau de bord', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Vehicules', href: '/admin/vehicules', icon: 'Car' },
  { label: 'Commandes', href: '/admin/commandes', icon: 'ShoppingBag' },
  { label: 'Clients', href: '/admin/clients', icon: 'Users' },
  { label: 'Parametres', href: '/admin/parametres', icon: 'Settings' },
] as const
