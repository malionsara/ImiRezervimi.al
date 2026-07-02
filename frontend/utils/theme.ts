// frontend/utils/theme.ts
// Theme system for salon categories - supports beauty salons and barbershops.
// Visuals are driven by CSS variables: set data-theme={theme.dataTheme} on the
// page root and every accent-* Tailwind class re-resolves to the category color
// (tokens defined in styles/globals.css).

import type { LucideIcon } from 'lucide-react'
import { Sparkles, Scissors, Flower2, Heart, Star, Brush } from 'lucide-react'

export type SalonCategory = 'beauty' | 'barbershop' | 'unisex'

export interface ThemeConfig {
  name: string
  dataTheme: 'beauty' | 'barbershop' | 'unisex'
  icon: LucideIcon
  icons: LucideIcon[]
  messaging: {
    heroTitle: string
    heroSubtitle: string
    ctaText: string
    categoryLabel: string
  }
}

export const themes: Record<SalonCategory, ThemeConfig> = {
  beauty: {
    name: 'Beauty Salon',
    dataTheme: 'beauty',
    icon: Sparkles,
    icons: [Sparkles, Brush, Flower2, Heart, Star],
    messaging: {
      heroTitle: 'Rezervo te salloni yt i preferuar',
      heroSubtitle: 'Platforma e parë shqiptare për rezervime online në sallone bukurie.',
      ctaText: 'Zbulo Sallone',
      categoryLabel: 'Sallone Bukurie'
    }
  },
  barbershop: {
    name: 'Barbershop',
    dataTheme: 'barbershop',
    icon: Scissors,
    icons: [Scissors, Star, Sparkles],
    messaging: {
      heroTitle: 'Rezervo te berberi yt i preferuar',
      heroSubtitle: 'Platforma e parë shqiptare për rezervime online në berberi dhe sallone për meshkuj.',
      ctaText: 'Zbulo Berberi',
      categoryLabel: 'Berberi & Sallone për Meshkuj'
    }
  },
  unisex: {
    name: 'Unisex',
    dataTheme: 'unisex',
    icon: Scissors,
    icons: [Scissors, Sparkles, Star],
    messaging: {
      heroTitle: 'Rezervo te salloni yt i preferuar',
      heroSubtitle: 'Platforma e parë shqiptare për rezervime online në sallone bukurie dhe berberi.',
      ctaText: 'Zbulo Sallone',
      categoryLabel: 'Sallone & Berberi'
    }
  }
}

export function getTheme(category: SalonCategory = 'beauty'): ThemeConfig {
  return themes[category] || themes.beauty
}
