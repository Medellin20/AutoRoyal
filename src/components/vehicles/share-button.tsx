'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copie.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Partage impossible depuis ce navigateur.')
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={share}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      Partager
    </Button>
  )
}
