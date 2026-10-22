# ImiRezervimi.al - Project Facts

## Product

**Name:** ImiRezervimi.al  
**Website:** https://imirezervimi.al  
**Tagline:** Albania's first beauty salon booking platform

**Summary:** ImiRezervimi.al bridges the gap between Instagram discovery and seamless booking for Albanian beauty salons. Customers discover salons on Instagram, click bio links to request appointments, and receive WhatsApp confirmations when approved by salon owners.

## Client

**Company:** Tech Atlas  
**Industry:** Beauty & Personal Care Technology  
**Country:** Albania  
**Target Market:** Albanian beauty salons and their Instagram-active customers

## Timeline

**Project Started:** June 2025  
**Current Status:** MVP Functional, in Beta  
**Launch Date:** Q1 2026 (planned)  
**Development Phase:** 5 months, ongoing

## The Brief

**Problem:** Albanian beauty salons are overwhelmed with Instagram DM booking requests. Customers struggle with back-and-forth messaging, no-shows are common, and salons manage appointments manually with pen and paper. There's no centralized platform connecting Instagram discovery (where customers find salons) with WhatsApp communication (how Albanians prefer to communicate).

**Target Users:**
- **Salons:** 800+ beauty salons across Albania (hair, nails, eyebrows, esthetics)
- **Customers:** Instagram-active Albanian women aged 18-45 in Tirana, Durrës, Vlorë, and Shkodër

**Solution:** A request-based booking platform that integrates with Instagram bio links and sends WhatsApp confirmations, giving salons control over their schedule while providing customers instant booking from their favorite Instagram profiles.

## What Was Built

### Public Website
- **Landing Page:** Albanian-language hero with gradient backgrounds, floating beauty icons (💅✨💄), and social proof from 500+ salons
- **Salon Discovery:** Grid view with search/filter by city and service type
- **Individual Salon Profiles:** Service listings, pricing, Instagram handles, "Book Now" CTAs

### Customer Web App
- **Booking Flow:** Select service → Fill form (name, phone, date, time, notes) → Submit request
- **Request Confirmation:** Albanian success messages: "Kërkesa u dërgua! Do të njoftoheni brenda 2 orësh ✨"
- **WhatsApp Integration:** Automatic notifications when appointments are approved
- **Albanian Localization:** Complete interface in Albanian language with special character support (ë, ç)

### Salon Dashboard
- **Pending Requests Queue:** Priority-sorted appointment requests with customer ratings
- **Customer Intelligence:** Shows rating (⭐ 4.8), total visits (12), no-show history
- **One-Click Approval:** "Aprovo" / "Refuzo" buttons trigger instant WhatsApp confirmations
- **Today's Schedule:** Calendar view of approved appointments
- **Availability Management:** Working hours configuration and time slot blocking

### Key Features
- **Smart Prioritization:** VIP customers (high ratings, regular visits) appear first in queue
- **Anti-Spam Protection:** Phone verification, booking limits, customer reputation system
- **WhatsApp Templates:** Pre-configured Albanian message templates for confirmations and reminders
- **Mobile-First Design:** Optimized for Instagram in-app browser on Android/iOS
- **PWA Support:** Installable progressive web app for easy re-access

## The Stack

**Frontend:**
- Next.js 15.3.5 (React 19, App Router)
- TypeScript 5
- Tailwind CSS 3.4.17
- Playwright 1.56.1 (E2E testing)

**Backend:**
- Next.js API Routes
- Supabase PostgreSQL (Database)
- Supabase Auth & RLS (Row-Level Security)

**Integrations:**
- Twilio WhatsApp Business API
- Instagram Basic Display API (planned)
- Google OAuth (authentication)

**Infrastructure:**
- Vercel (Hosting & Edge Functions)
- Supabase (Database & Authentication)
- Cloudflare DNS

**Developer Tools:**
- ESLint, Prettier (Code quality)
- Git + GitHub (Version control)
- Claude Code (AI pair programming)

## What Comes Next

**Q1 2026 - Production Launch:**
- Fix phone validation bug (blocks new registrations)
- Complete salon discovery page
- Add salon appointments visibility
- Security audit (admin auth, webhook verification)

**Q2 2026 - Mobile App:**
- React Native mobile app for iOS/Android
- Push notifications for appointment updates
- Photo uploads for service inspiration
- In-app messaging between customers and salons

**Q3 2026 - Growth Features:**
- Advanced analytics for salon owners
- Multi-staff scheduling and calendars
- Customer loyalty programs
- Payment processing integration

**Q4 2026 - Regional Expansion:**
- Launch in Kosovo and North Macedonia
- Multi-language support (Albanian, English)
- API for third-party integrations
- White-label solution for salon chains

## Image Alt Text

### Gallery Images

**1-homepage.png** (1600×1000)  
Alt: ImiRezervimi.al homepage hero with Albanian text "Rezervo te salloni yt i preferuar" and gradient pink-to-orange background

**2-salons-grid.png** (1600×1000)  
Alt: Grid of 6 Albanian beauty salons with search bar, showing locations in Tiranë, Durrës, and Vlorë

**3-booking-form.png** (1600×1000)  
Alt: Booking form for Klea Beauty Studio with service selection, date picker, and Albanian language fields

**4-salon-dashboard.png** (1600×1000)  
Alt: Salon dashboard showing pending appointment requests queue with customer ratings and priority scores

**5-mobile-homepage.png** (1320×2868)  
Alt: Mobile view of homepage hero section with "Zbulo Sallone" button and floating beauty icons

**6-mobile-salons.png** (1320×2868)  
Alt: Mobile salon browsing grid with search bar "Kërko sipas emrit, qytetit" and salon cards

**7-mobile-booking.png** (1320×2868)  
Alt: Mobile booking form with service cards for Manikyr, Pedikyr, and Ngjyrosje Flokësh

### Cover Poster

**cover-poster.jpg** (1920×1200)  
Alt: Browser window showing appointment approval in salon dashboard with "Rezervimi u bë me sukses" confirmation message
