// frontend/utils/theme.ts
// Theme system for salon categories - supports beauty salons and barbershops

export type SalonCategory = 'beauty' | 'barbershop' | 'unisex'

export interface ThemeConfig {
  name: string
  primaryGradient: string
  primaryGradientHover: string
  backgroundGradient: string
  backgroundGradientLight: string
  accentColor: string
  accentColorLight: string
  icon: string
  icons: string[]
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
    primaryGradient: 'from-red-500 via-pink-500 to-orange-500',
    primaryGradientHover: 'from-red-600 via-pink-600 to-orange-600',
    backgroundGradient: 'from-pink-50 via-red-50 to-orange-50',
    backgroundGradientLight: 'from-pink-100 via-red-100 to-orange-100',
    accentColor: 'red-500',
    accentColorLight: 'red-100',
    icon: '💅',
    icons: ['💅', '✨', '💄', '💋', '🌸'],
    messaging: {
      heroTitle: 'Rezervo te salloni yt i preferuar',
      heroSubtitle: 'Platforma e parë shqiptare për rezervime online në sallone bukurie.',
      ctaText: 'Zbulo Sallone',
      categoryLabel: 'Sallone Bukurie'
    }
  },
  barbershop: {
    name: 'Barbershop',
    primaryGradient: 'from-slate-700 via-gray-800 to-slate-900',
    primaryGradientHover: 'from-slate-800 via-gray-900 to-black',
    backgroundGradient: 'from-slate-50 via-gray-50 to-slate-100',
    backgroundGradientLight: 'from-slate-100 via-gray-100 to-slate-200',
    accentColor: 'slate-700',
    accentColorLight: 'slate-100',
    icon: '✂️',
    icons: ['✂️', '💈', '🪒', '💼', '⭐'],
    messaging: {
      heroTitle: 'Rezervo te berberi yt i preferuar',
      heroSubtitle: 'Platforma e parë shqiptare për rezervime online në berberi dhe sallone për meshkuj.',
      ctaText: 'Zbulo Berberi',
      categoryLabel: 'Berberi & Sallone për Meshkuj'
    }
  },
  unisex: {
    name: 'Unisex',
    primaryGradient: 'from-blue-500 via-indigo-500 to-purple-500',
    primaryGradientHover: 'from-blue-600 via-indigo-600 to-purple-600',
    backgroundGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    backgroundGradientLight: 'from-blue-100 via-indigo-100 to-purple-100',
    accentColor: 'blue-500',
    accentColorLight: 'blue-100',
    icon: '💇',
    icons: ['💇', '✨', '💆', '🌟', '⭐'],
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

export function getThemeClasses(category: SalonCategory = 'beauty', type: 'primary' | 'background' | 'accent' = 'primary'): string {
  const theme = getTheme(category)
  
  switch (type) {
    case 'primary':
      return theme.primaryGradient
    case 'background':
      return theme.backgroundGradient
    case 'accent':
      return theme.accentColor
    default:
      return theme.primaryGradient
  }
}

