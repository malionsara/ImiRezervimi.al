# Salon Categories Implementation Guide

## Overview

This document describes the implementation of salon categories to support both beauty salons and barbershops in the ImiRezervimi.al platform.

## Problem Statement

The platform was originally designed for beauty salons with a feminine aesthetic (pink/red gradients, beauty-focused messaging). However, barbershops wanted to join, and the current design didn't appeal to a male audience.

## Solution: Category-Based Dynamic Theming

We've implemented a category system that allows salons to be categorized as:
- **beauty** - Beauty salons (default, maintains current feminine design)
- **barbershop** - Barbershops (masculine, professional design)
- **unisex** - Unisex salons (neutral design)

Each category has its own theme with appropriate colors, icons, and messaging.

## Implementation Details

### 1. Theme System (`frontend/utils/theme.ts`)

A centralized theme utility that provides:
- Color schemes (gradients, backgrounds, accents)
- Icons appropriate for each category
- Messaging (hero titles, CTAs, labels)

**Usage:**
```typescript
import { getTheme, SalonCategory } from '../utils/theme'

const theme = getTheme('barbershop') // or 'beauty', 'unisex'
// theme.primaryGradient, theme.backgroundGradient, theme.messaging, etc.
```

### 2. Database Schema

**Migration:** `database/008_add_salon_category.sql`

Adds:
- `salon_category` enum type: `'beauty' | 'barbershop' | 'unisex'`
- `category` column to `salons` table (defaults to `'beauty'`)
- Index on `category` for performance

**To apply migration:**
```sql
-- Run in Supabase SQL Editor
-- See database/008_add_salon_category.sql
```

### 3. TypeScript Types (`frontend/types/database.ts`)

Updated types to include:
- `SalonCategory` type
- `category` field in `SalonRow` and `Salon` interfaces

### 4. Homepage Updates (`frontend/pages/index.js`)

Updated homepage to:
- Support both audiences with dual messaging
- Include category selector buttons
- Mixed icons (beauty salon + barbershop)
- Updated meta descriptions to be inclusive

## Theme Configurations

### Beauty Salon Theme
- **Colors:** Red/Pink/Orange gradients
- **Icons:** 💅 ✨ 💄 💋 🌸
- **Messaging:** "Rezervo te salloni yt i preferuar"
- **Target:** Female audience

### Barbershop Theme
- **Colors:** Slate/Gray/Black gradients
- **Icons:** ✂️ 💈 🪒 💼 ⭐
- **Messaging:** "Rezervo te berberi yt i preferuar"
- **Target:** Male audience

### Unisex Theme
- **Colors:** Blue/Indigo/Purple gradients
- **Icons:** 💇 ✨ 💆 🌟 ⭐
- **Messaging:** Generic salon messaging
- **Target:** All audiences

## Next Steps

### For Booking Pages

Update booking pages (`frontend/pages/[slug].tsx`) to use dynamic theming:

```typescript
import { getTheme } from '../utils/theme'

// In component
const theme = getTheme(salon.category || 'beauty')

// Use theme classes
<div className={`bg-gradient-to-br ${theme.backgroundGradient}`}>
  <h1>{theme.messaging.heroTitle}</h1>
</div>
```

### For Salon Registration

Add category selection to salon registration form:
- Radio buttons or dropdown for category selection
- Default to 'beauty' for backward compatibility
- Show preview of theme when category is selected

### For Salon Listings

Update `/salons` page to:
- Filter by category (`?category=barbershop`)
- Show category badges
- Apply appropriate theme per salon

## Migration Guide

### Existing Salons

All existing salons default to `'beauty'` category. To update:

```sql
-- Update specific salons to barbershop
UPDATE salons 
SET category = 'barbershop' 
WHERE slug IN ('barber_slug_1', 'barber_slug_2');

-- Or bulk update based on keywords
UPDATE salons 
SET category = 'barbershop' 
WHERE (
    LOWER(name) LIKE '%berber%' OR 
    LOWER(name) LIKE '%barber%' OR
    LOWER(description) LIKE '%berber%'
) AND category = 'beauty';
```

## Benefits

1. **Dual Audience Support** - Platform appeals to both female and male customers
2. **Brand Consistency** - Each salon type gets appropriate branding
3. **Scalability** - Easy to add more categories in the future
4. **Backward Compatible** - Existing salons default to 'beauty' category
5. **Performance** - Indexed category field for fast filtering

## Testing Checklist

- [ ] Apply database migration
- [ ] Verify category field exists in salons table
- [ ] Test homepage category selector buttons
- [ ] Test booking page with different categories
- [ ] Verify theme applies correctly per category
- [ ] Test salon registration with category selection
- [ ] Test salon filtering by category
- [ ] Verify mobile responsiveness

## Future Enhancements

1. **Category-Specific Services** - Different service categories per salon type
2. **Category-Specific Features** - Features tailored to each category
3. **Analytics** - Track performance by category
4. **Marketing** - Category-specific marketing campaigns
5. **SEO** - Category-specific landing pages for better SEO

