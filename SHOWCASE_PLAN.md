# ImiRezervimi.al - Showcase Video Plan

## Product Overview
**ImiRezervimi.al** - Albania's first beauty salon booking platform connecting Instagram discovery to WhatsApp confirmations. Customers find salons on Instagram, book through bio links, and receive WhatsApp confirmations when approved by salons.

---

## Video Flow (30 seconds)

### Act 1: Landing & Discovery (8 seconds)
**Screen:** Homepage (`/`)
- Open on the hero section with Albanian text "Rezervo te salloni yt i preferuar"
- Show the gradient background animation and floating beauty icons (💅✨💄)
- Pause 1s on the main headline
- **Click:** "Zbulo Sallone" (Discover Salons) button
- Dissolve transition to salons page

### Act 2: Browse & Select (7 seconds)
**Screen:** Salons Directory (`/salons`)
- Show grid of 6 demo salons with Albanian names
- Scroll down briefly to show more salons
- Focus on search box showing Albanian placeholder "Kërko sipas emrit, qytetit..."
- **Click:** Salon card for "Klea Beauty Studio"

### Act 3: Book Appointment (10 seconds)
**Screen:** Salon Booking Page (`/klea-beauty-studio/book`)
- Show salon header: name, location (Tiranë), Instagram handle
- Display service cards: Manikyr (€15, 45min), Pedikyr (€20, 60min), Ngjyrosje Flokësh (€35, 90min)
- **Select:** "Manikyr" service
- Fill form:
  - Customer name: "Elona Hoxha" (autofill)
  - Phone: "+355692345678" (autofill)
  - Date: Tomorrow's date
  - Time: 14:00
  - Notes: "Preferoj ngjyrë të kuqe" (I prefer red color)
- **Click:** "Dërgo Kërkesën" (Send Request) button
- Show success message: "Kërkesa u dërgua! Do të njoftoheni brenda 2 orësh ✨"

### Act 4: Salon Approval (5 seconds)
**Screen:** Salon Dashboard (`/salon/dashboard?salonId=klea-beauty-studio`)
- Cut to salon owner view
- Show pending requests queue with priority scores
- Focus on the new request from Elona Hoxha
- Display customer priority badge: "⭐ 4.8 rating • 12 vizita"
- **Click:** "Aprovo" (Approve) button
- Show confirmation: "Rezervimi u bë me sukses! Klienti do të marrë njoftim në WhatsApp"

---

## Demo Data Requirements

### Salons (5 total)
1. **Klea Beauty Studio** (Featured in video)
   - Slug: `klea-beauty-studio`
   - City: Tiranë
   - Address: "Rruga e Kavajës 145, Tiranë"
   - Instagram: `@klea.beauty.al`
   - Description: "Sallon modern i bukurisë në zemër të Tiranës. Specialisht për thonj dhe vetulla."
   - Services: Manikyr (€15, 45min), Pedikyr (€20, 60min), Ngjyrosje Flokësh (€35, 90min)

2. **Sara's Nails & Spa**
   - Slug: `saras-nails-spa`
   - City: Tiranë
   - Address: "Blloku, Rruga Pjeter Bogdani"
   - Instagram: `@saras_nails_tirana`

3. **Diva Hair Salon**
   - Slug: `diva-hair-salon`
   - City: Durrës
   - Address: "Rruga Taulantia 89"
   - Instagram: `@divahair.durres`

4. **Glam Studio Tirana**
   - Slug: `glam-studio-tirana`
   - City: Tiranë
   - Address: "21 Dhjetori, Pranë Pazarit të Ri"
   - Instagram: `@glamstudio.al`

5. **Elegance Beauty Lounge**
   - Slug: `elegance-beauty-lounge`
   - City: Vlorë
   - Address: "Rruga Ismail Qemali 23"
   - Instagram: `@elegance.vlore`

### Customer (Demo Account)
- Name: Elona Hoxha
- Phone: `+355692345678`
- Email: `elona.hoxha@example.com`
- Instagram ID: `elona_beauty_al`
- Rating: 4.8 / 5.0
- Total Visits: 12
- No Shows: 0
- Account Type: `social` (Instagram authenticated)
- Created: 3 months ago

### Existing Appointments (To show activity)
For "Klea Beauty Studio":
- 2 approved appointments for today (showing in calendar)
- 1 completed appointment yesterday
- The new pending request from Elona (created during video)

---

## Technical Details

### Database Seed Script Location
`/scripts/seed-demo-data.ts`

**Safety Checks:**
- Refuse to run if `NEXT_PUBLIC_SUPABASE_URL` contains `imirezervimi.al` (production)
- Only run against local dev or staging database
- Add `--force-demo` flag requirement
- Clear warning banner: "⚠️ DEMO DATA ONLY - NOT FOR PRODUCTION"

### Environment
- Target: Development/Staging database (not production)
- Use real phone format validation: `+355XXXXXXXX`
- Use `@example.com` emails
- Instagram handles are fake/demo only

### Recording Setup
- **Browser:** Chrome with Playwright
- **Viewport:** 1440×900 @ 2× device scale
- **Recording:** Chrome DevTools Protocol screencast
- **Frame Rate:** 30fps
- **Output Resolution:** 2880×1800 (master) → 1920×1200 (final)
- **Encoding:** H.264, CRF 12 (master), CRF 14 (final)

### Event Logging
Log every action to `showcase/events.json`:
```json
{
  "timestamp": 1234.56,
  "type": "click" | "type" | "scroll" | "wait" | "moment",
  "description": "Click Zbulo Sallone button",
  "element": "button.cta-discover",
  "coordinates": { "x": 720, "y": 450 }
}
```

---

## Visual Style

### Browser Window
- Width: 1600px content area
- Title bar: 52px height
- Window dots (red, yellow, green) on left
- URL bar showing: `imirezervimi.al/salons` etc.
- Clean, centered on near-black stage (#0a0a0a)

### Camera Movements
- Zoom in to 1.4× when filling booking form
- Zoom in to 1.5× when clicking approve button
- Ease in/out transitions (300ms)
- Return to 1× zoom between major sections

### Pointer
- Custom cursor: 16×16px circle
- Color: White with subtle shadow
- Press effect: Scale to 0.9× on click
- Click ripple: 40px expanding circle

### Transitions
- Homepage → Salons: 600ms cross-dissolve
- Salons → Booking: 400ms fade
- Booking → Dashboard: 400ms cross-dissolve (cuts to different user)

---

## Albanian Language Notes

All UI text is in Albanian:
- **Buttons:** "Dërgo Kërkesën" (Send Request), "Aprovo" (Approve), "Refuzo" (Decline)
- **Success Messages:** "Kërkesa u dërgua!" (Request sent!), "Rezervimi u bë me sukses!" (Booking successful!)
- **Form Labels:** "Emri" (Name), "Telefoni" (Phone), "Data" (Date), "Ora" (Time)
- **Navigation:** "Sallone" (Salons), "Dashboard", "Rezervimet" (Bookings)

---

## Deliverables

### Files to Generate
```
showcase/
├── showcase-1920x1200.mp4          # Final edited video (25-35s)
├── cover-poster.jpg                # Still from video (1920×1200)
├── gallery/
│   ├── 1-homepage.png              # Homepage hero (1600×1000)
│   ├── 2-salons-grid.png           # Salons browsing (1600×1000)
│   ├── 3-booking-form.png          # Booking page (1600×1000)
│   ├── 4-salon-dashboard.png       # Salon dashboard (1600×1000)
│   ├── 5-mobile-homepage.png       # Mobile home (1320×2868, iPhone)
│   ├── 6-mobile-salons.png         # Mobile salons (1320×2868)
│   └── 7-mobile-booking.png        # Mobile booking (1320×2868)
├── facts.md                        # Project facts
└── events.json                     # Video event log
```

### Recording Scripts
```
scripts/
├── seed-demo-data.ts               # Database seed script
├── record-showcase.ts              # Playwright recording script
└── edit-showcase.tsx               # Remotion composition
```

---

## Click Path Summary

1. **Homepage** → Click "Zbulo Sallone"
2. **Salons** → Scroll → Click "Klea Beauty Studio"
3. **Booking** → Select "Manikyr" → Fill form → Click "Dërgo Kërkesën"
4. **Success** → Show confirmation message
5. **Dashboard** (cut) → View pending request → Click "Aprovo"
6. **Confirmation** → Show success message

**Total Duration:** ~30 seconds
**Total Clicks:** 5 key interactions
**Camera Zooms:** 3 moments (form, approval, result)

---

## Questions for Approval

1. ✅ Does the flow accurately represent the product's value proposition?
2. ✅ Is 30 seconds the right length, or should we extend to 35s?
3. ✅ Should we show the WhatsApp confirmation message at the end?
4. ✅ Any specific salons/services you want featured?
5. ✅ Should we include the Instagram bio link integration somehow?

**Ready to proceed once approved! 🎬**
