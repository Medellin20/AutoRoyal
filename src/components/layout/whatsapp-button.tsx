'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { whatsappLink } from '@/lib/utils'

export function WhatsAppButton() {
  const reduced = useReducedMotion()

  return (
    <motion.a
      href={whatsappLink(`Bonjour ${siteConfig.name}, je souhaite des informations sur vos vehicules.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ecrire sur WhatsApp"
      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.a>
  )
}
