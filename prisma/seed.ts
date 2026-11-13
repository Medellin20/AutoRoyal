/**
 * Donnees de demonstration.
 * Lancer avec : npm run db:seed
 * Le compte administrateur provient des variables d environnement, jamais du code.
 */
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Images de demonstration libres de droits (Unsplash), a remplacer par vos photos. */
const demoPhotos = [
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200&q=70',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=70',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=70',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=70',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=70',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=70',
]

type SeedVehicle = Omit<
  Prisma.VehicleCreateInput,
  'slug' | 'images' | 'publishedAt'
> & { photos?: number[] }

const vehicles: SeedVehicle[] = [
  {
    reference: 'VEH-0001', brand: 'Toyota', model: 'Corolla', version: '1.8 Hybrid Lounge',
    category: 'BERLINE', year: 2021, offerType: 'BOTH', status: 'AVAILABLE',
    salePrice: 14_940, dailyPrice: 53, weeklyPrice: 320, monthlyPrice: 1_143, deposit: 305,
    mileage: 48_000, fuel: 'HYBRIDE', transmission: 'AUTOMATIQUE', color: 'Gris argent',
    seats: 5, doors: 5, power: 122, featured: true, published: true, views: 184,
    description:
      "Corolla hybride de 2021 achetee neuve et entretenue chez le concessionnaire, carnet complet a l appui. La batterie a ete testee a 92 % de sa capacite en juin. Consommation relevee : 4,6 l aux 100 km en usage urbain. Pneus avant remplaces a 45 000 km.",
    features: ['Climatisation automatique', 'Camera de recul', 'Regulateur adaptatif', 'Apple CarPlay', 'Capteurs de stationnement', 'Jantes alliage 17 pouces'],
    rentalConditions: "Permis valide depuis plus de deux ans. 200 km inclus par jour. Assurance tous risques comprise, franchise de 230 €.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire', 'Justificatif de domicile'],
    photos: [0, 1, 2],
  },
  {
    reference: 'VEH-0002', brand: 'Toyota', model: 'RAV4', version: '2.5 Hybrid AWD',
    category: 'SUV', year: 2022, offerType: 'SALE', status: 'AVAILABLE',
    salePrice: 28_203, mileage: 32_000, fuel: 'HYBRIDE', transmission: 'AUTOMATIQUE',
    color: 'Blanc nacre', seats: 5, doors: 5, power: 222, featured: true, published: true, views: 231,
    description:
      "RAV4 hybride quatre roues motrices, premiere main, importee neuve. Revision des 30 000 km effectuee dans notre atelier avec vidange, filtres et controle des freins. Carrosserie sans reprise de peinture, verifiee au mesureur d epaisseur.",
    features: ['Traction integrale', 'Toit ouvrant', 'Hayon electrique', 'Sieges chauffants', 'Ecran 10 pouces', 'Aide au maintien de voie'],
    photos: [3, 4],
  },
  {
    reference: 'VEH-0003', brand: 'Hyundai', model: 'Tucson', version: '1.6 CRDi Executive',
    category: 'SUV', year: 2020, offerType: 'BOTH', status: 'AVAILABLE',
    salePrice: 18_629, dailyPrice: 69, weeklyPrice: 412, monthlyPrice: 1_448, deposit: 381,
    mileage: 67_500, fuel: 'DIESEL', transmission: 'AUTOMATIQUE', color: 'Bleu nuit',
    seats: 5, doors: 5, power: 136, published: true, views: 96,
    description:
      "Tucson diesel automatique, ideal pour les longs trajets. Distribution verifiee, embrayage teste sous charge. Interieur cuir en bon etat general, quelques marques d usage sur le siege conducteur signalees en photo.",
    features: ['GPS integre', 'Sieges cuir', 'Camera 360', 'Demarrage sans cle', 'Regulateur de vitesse'],
    rentalConditions: "Caution de 380 €. Kilometrage illimite au forfait mensuel.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire'],
    photos: [5, 0],
  },
  {
    reference: 'VEH-0004', brand: 'Suzuki', model: 'Swift', version: '1.2 Dualjet',
    category: 'CITADINE', year: 2022, offerType: 'RENT', status: 'AVAILABLE',
    dailyPrice: 34, weeklyPrice: 201, monthlyPrice: 732, deposit: 183,
    mileage: 24_300, fuel: 'ESSENCE', transmission: 'MANUELLE', color: 'Rouge',
    seats: 5, doors: 5, power: 90, published: true, views: 143,
    description:
      "Citadine agile et economique, parfaite pour circuler en ville. Consommation moyenne de 5,2 l aux 100 km. Entretenue tous les 10 000 km dans notre atelier. Modele le plus demande de notre flotte de location.",
    features: ['Climatisation', 'Bluetooth', 'Vitres electriques', 'Direction assistee'],
    rentalConditions: "Age minimum : 23 ans. 200 km inclus par jour, puis 0,23 € par kilometre supplementaire.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire', 'Caution'],
    photos: [1, 2],
  },
  {
    reference: 'VEH-0005', brand: 'Toyota', model: 'Hilux', version: '2.4 D-4D Double Cabine',
    category: 'PICKUP', year: 2021, offerType: 'BOTH', status: 'RENTED',
    salePrice: 32_014, dailyPrice: 91, weeklyPrice: 549, monthlyPrice: 1_906, deposit: 610,
    mileage: 89_000, fuel: 'DIESEL', transmission: 'MANUELLE', color: 'Blanc',
    seats: 5, doors: 4, power: 150, featured: true, published: true, views: 312,
    description:
      "Pick-up double cabine utilise par une societe de BTP, revise tous les 8 000 km. Amortisseurs arriere remplaces en janvier. Benne protegee par un revetement anti-rayures. Vehicule robuste, adapte aux pistes.",
    features: ['4x4 enclenchable', 'Barre anti-encastrement', 'Attelage', 'Protection de benne', 'Climatisation'],
    rentalConditions: "Reserve aux conducteurs de plus de 25 ans. Usage chantier autorise, usage tout-terrain extreme exclu.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire', 'Attestation employeur'],
    photos: [3, 5],
  },
  {
    reference: 'VEH-0006', brand: 'Kia', model: 'Picanto', version: '1.0 Motion',
    category: 'CITADINE', year: 2023, offerType: 'RENT', status: 'AVAILABLE',
    dailyPrice: 27, weeklyPrice: 165, monthlyPrice: 610, deposit: 152,
    mileage: 12_800, fuel: 'ESSENCE', transmission: 'MANUELLE', color: 'Blanc',
    seats: 5, doors: 5, power: 67, published: true, views: 88,
    description:
      "La plus economique de notre flotte. Vehicule recent, faible kilometrage, ideal pour un premier deplacement en ville ou un budget serre. Consommation autour de 4,9 l aux 100 km.",
    features: ['Climatisation', 'Radio Bluetooth', 'Airbags conducteur et passager'],
    rentalConditions: "Caution de 150 €. Lieu de remise convenu au moment de la reservation.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire'],
    photos: [4, 0],
  },
  {
    reference: 'VEH-0007', brand: 'Mercedes-Benz', model: 'Classe C', version: 'C220d AMG Line',
    category: 'LUXE', year: 2020, offerType: 'SALE', status: 'AVAILABLE',
    salePrice: 37_350, mileage: 54_000, fuel: 'DIESEL', transmission: 'AUTOMATIQUE',
    color: 'Noir obsidienne', seats: 5, doors: 4, power: 194, featured: true, published: true, views: 267,
    description:
      "Classe C finition AMG Line, entretien exclusivement en reseau agree jusqu a 50 000 km, puis dans notre atelier. Sellerie cuir noir sans dechirure. Quatre pneus Michelin poses en mars. Vehicule non fumeur.",
    features: ['Sellerie cuir', 'Ecran tactile 10 pouces', 'Sieges electriques a memoire', 'Eclairage d ambiance', 'Aide au stationnement automatique', 'Systeme audio Burmester'],
    photos: [2, 3, 1],
  },
  {
    reference: 'VEH-0008', brand: 'Nissan', model: 'Qashqai', version: '1.5 dCi Acenta',
    category: 'SUV', year: 2019, offerType: 'BOTH', status: 'AVAILABLE',
    salePrice: 14_483, dailyPrice: 58, weeklyPrice: 348, monthlyPrice: 1_250, deposit: 305,
    mileage: 96_400, fuel: 'DIESEL', transmission: 'MANUELLE', color: 'Gris anthracite',
    seats: 5, doors: 5, power: 115, published: true, views: 74,
    description:
      "Qashqai diesel bien equipe, kilometrage coherent avec l annee. Embrayage remplace a 90 000 km, facture disponible. Petites rayures sur le pare-chocs arriere, signalees sur les photos et deduites du prix.",
    features: ['Camera de recul', 'Regulateur de vitesse', 'Climatisation automatique', 'Jantes alliage'],
    rentalConditions: "Permis de plus de deux ans. Assurance tous risques incluse.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire', 'Justificatif de domicile'],
    photos: [5, 4],
  },
  {
    reference: 'VEH-0009', brand: 'Toyota', model: 'Hiace', version: '2.5 D-4D 15 places',
    category: 'UTILITAIRE', year: 2018, offerType: 'RENT', status: 'AVAILABLE',
    dailyPrice: 114, weeklyPrice: 686, monthlyPrice: 2_439, deposit: 534,
    mileage: 158_000, fuel: 'DIESEL', transmission: 'MANUELLE', color: 'Blanc',
    seats: 15, doors: 4, power: 102, published: true, views: 121,
    description:
      "Minibus quinze places pour les transferts de groupe, seminaires et evenements familiaux. Suspension revisee, climatisation arriere fonctionnelle. Un chauffeur peut etre mis a disposition sur demande.",
    features: ['Climatisation avant et arriere', 'Galerie de toit', 'Ceintures trois points', 'Grande soute'],
    rentalConditions: "Chauffeur disponible en option (38 € par jour). Tout trajet hors de France metropolitaine doit etre autorise par ecrit.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire categorie D', 'Caution'],
    photos: [0, 3],
  },
  {
    reference: 'VEH-0010', brand: 'Peugeot', model: '3008', version: '1.5 BlueHDi Allure',
    category: 'SUV', year: 2021, offerType: 'SALE', status: 'RESERVED',
    salePrice: 24_087, mileage: 41_200, fuel: 'DIESEL', transmission: 'AUTOMATIQUE',
    color: 'Gris platinium', seats: 5, doors: 5, power: 130, published: true, views: 156,
    description:
      "3008 finition Allure avec le poste de conduite i-Cockpit. Vehicule importe d Europe, dedouane, papiers en regle. Revision complete effectuee a l arrivee : vidange, filtres, plaquettes avant.",
    features: ['i-Cockpit numerique', 'Hayon mains libres', 'Navigation connectee', 'Sieges chauffants', 'Regulateur adaptatif'],
    photos: [1, 5],
  },
  {
    reference: 'VEH-0011', brand: 'Honda', model: 'CR-V', version: '1.5 VTEC Turbo Elegance',
    category: 'SUV', year: 2020, offerType: 'BOTH', status: 'AVAILABLE',
    salePrice: 21_648, dailyPrice: 73, weeklyPrice: 439, monthlyPrice: 1_524, deposit: 381,
    mileage: 72_000, fuel: 'ESSENCE', transmission: 'AUTOMATIQUE', color: 'Argent',
    seats: 5, doors: 5, power: 173, published: true, views: 63,
    description:
      "CR-V essence turbo, boite automatique a variation continue. Habitacle spacieux, coffre de 561 litres. Historique d entretien complet, courroie et filtres remplaces a 70 000 km.",
    features: ['Camera de recul', 'Sieges electriques', 'Toit ouvrant', 'Capteurs d angle mort', 'Demarrage sans cle'],
    rentalConditions: "Caution de 380 €. 200 km inclus par jour.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire'],
    photos: [2, 4],
  },
  {
    reference: 'VEH-0012', brand: 'Renault', model: 'Duster', version: '1.5 dCi 4x2 Zen',
    category: 'SUV', year: 2019, offerType: 'RENT', status: 'MAINTENANCE',
    dailyPrice: 46, weeklyPrice: 274, monthlyPrice: 991, deposit: 229,
    mileage: 112_000, fuel: 'DIESEL', transmission: 'MANUELLE', color: 'Beige sable',
    seats: 5, doors: 5, power: 110, published: true, views: 52,
    description:
      "Duster robuste et sobre, apprecie pour les routes secondaires. Actuellement a l atelier pour le remplacement des amortisseurs arriere et une revision complete. Retour prevu sous une semaine.",
    features: ['Climatisation', 'Barres de toit', 'Radio Bluetooth', 'Garde au sol de 210 mm'],
    rentalConditions: "Disponible des la fin de la revision. Reservez pour etre prioritaire.",
    requiredDocuments: ['Piece d identite', 'Permis de conduire'],
    photos: [3, 0],
  },
]

async function main() {
  console.log('Nettoyage des donnees de demonstration...')
  await prisma.auditLog.deleteMany()
  await prisma.loginAttempt.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.purchaseRequest.deleteMany()
  await prisma.vehicleImage.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.user.deleteMany()

  // ---------------------------------------------------- Administrateurs
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL et ADMIN_PASSWORD doivent etre definis dans .env avant de lancer le seed.',
    )
  }
  if (adminPassword.length < 10) {
    throw new Error('ADMIN_PASSWORD doit contenir au moins 10 caracteres.')
  }

  const superAdmin = await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME ?? 'Super Admin',
      email: adminEmail.toLowerCase(),
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'SUPER_ADMIN',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Gestionnaire parc',
      email: 'gestionnaire@autoroyal.com',
      passwordHash: await bcrypt.hash(`${adminPassword}-gestion`, 12),
      role: 'MANAGER',
    },
  })

  console.log(`Compte super administrateur cree : ${superAdmin.email}`)

  // ---------------------------------------------------- Vehicules
  const created = []
  for (const { photos = [0], ...data } of vehicles) {
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        slug: slugify(`${data.brand} ${data.model} ${data.year} ${data.reference}`),
        publishedAt: data.published ? new Date() : null,
        images: {
          create: photos.map((photoIndex, position) => ({
            url: demoPhotos[photoIndex % demoPhotos.length],
            alt: `${data.brand} ${data.model} ${data.year}`,
            position,
            isMain: position === 0,
          })),
        },
      },
    })
    created.push(vehicle)
  }
  console.log(`${created.length} vehicules crees.`)

  // ---------------------------------------------------- Clients
  const customers = await Promise.all([
    prisma.customer.create({
      data: { fullName: 'Camille Martin', email: 'camille.martin@example.com', phone: '+33639980001', address: 'Paris, France' },
    }),
    prisma.customer.create({
      data: { fullName: 'Nadia Bernard', email: 'nadia.bernard@example.com', phone: '+33639980002', address: 'Lyon, France' },
    }),
    prisma.customer.create({
      data: { fullName: 'Hugo Petit', email: 'hugo.petit@example.com', phone: '+33639980003', address: 'Nantes, France' },
    }),
  ])

  // ---------------------------------------------------- Reservations
  const day = 86_400_000
  const now = Date.now()

  await prisma.reservation.createMany({
    data: [
      {
        reference: 'RES-DEMO-0001',
        vehicleId: created[0].id,
        customerId: customers[0].id,
        startDate: new Date(now + 2 * day),
        endDate: new Date(now + 6 * day),
        pickupPlace: 'Lieu convenu en France metropolitaine',
        returnPlace: 'Lieu convenu en France metropolitaine',
        days: 4,
        totalPrice: 221,
        extraFees: 8,
        status: 'PENDING',
        message: 'Besoin d un siege enfant si possible.',
      },
      {
        reference: 'RES-DEMO-0002',
        vehicleId: created[4].id,
        customerId: customers[2].id,
        startDate: new Date(now - 3 * day),
        endDate: new Date(now + 4 * day),
        pickupPlace: 'Lieu convenu en France metropolitaine',
        returnPlace: 'Lieu convenu en France metropolitaine',
        days: 7,
        totalPrice: 556,
        extraFees: 8,
        status: 'ONGOING',
      },
      {
        reference: 'RES-DEMO-0003',
        vehicleId: created[3].id,
        customerId: customers[1].id,
        startDate: new Date(now - 20 * day),
        endDate: new Date(now - 14 * day),
        pickupPlace: 'Lieu convenu en France metropolitaine',
        returnPlace: 'Lieu convenu en France metropolitaine',
        days: 6,
        totalPrice: 224,
        extraFees: 23,
        status: 'COMPLETED',
      },
    ],
  })

  // ---------------------------------------------------- Demandes d achat
  await prisma.purchaseRequest.createMany({
    data: [
      {
        reference: 'ACH-DEMO-0001',
        vehicleId: created[6].id,
        customerId: customers[1].id,
        budget: 35_063,
        payment: 'VIREMENT',
        financing: true,
        tradeIn: true,
        tradeInInfo: 'Toyota Yaris 2015, 130 000 km',
        message: 'Possible de voir la voiture samedi matin ?',
        status: 'NEW',
      },
      {
        reference: 'ACH-DEMO-0002',
        vehicleId: created[1].id,
        customerId: customers[2].id,
        budget: 27_441,
        payment: 'CASH',
        status: 'IN_PROGRESS',
        internalNote: 'Client rappele le 12, attend l accord de sa banque.',
      },
    ],
  })

  // ---------------------------------------------------- Parametres du site
  await prisma.siteSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      garageName: 'Laurent Crash Autos',
      tagline: 'Louez ou achetez votre prochaine voiture, sans mauvaise surprise.',
      phone: '',
      whatsapp: '',
      email: 'contact@autoroyal.com',
      address: 'France metropolitaine',
      accentColor: '#ED1C24',
    },
  })

  console.log('Donnees de demonstration inserees.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
