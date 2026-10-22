# ImiRezervimi.al - Showcase Production Guide

This folder contains the complete showcase pack for Tech Atlas portfolio case study.

## 📦 Deliverables

```
showcase/
├── showcase-1920x1200.mp4    # Product video (25-35 seconds)
├── cover-poster.jpg           # Still from video (1920×1200)
├── gallery/                   # Screenshots (7 total)
│   ├── 1-homepage.png         # Desktop (1600×1000)
│   ├── 2-salons-grid.png      # Desktop (1600×1000)
│   ├── 3-booking-form.png     # Desktop (1600×1000)
│   ├── 4-salon-dashboard.png  # Desktop (1600×1000)
│   ├── 5-mobile-homepage.png  # Mobile (1320×2868)
│   ├── 6-mobile-salons.png    # Mobile (1320×2868)
│   └── 7-mobile-booking.png   # Mobile (1320×2868)
├── facts.md                   # Project facts and alt text
└── events.json                # Video event log (generated)
```

## 🎬 Production Workflow

### Step 1: Seed Demo Data

Create realistic Albanian demo data in your development database:

```bash
# Install dependencies
npm install

# Seed demo data (requires --force-demo flag for safety)
npx tsx scripts/seed-demo-data.ts --force-demo
```

**Demo Data Created:**
- 5 Albanian beauty salons (Tirana, Durrës, Vlorë)
- 1 customer: Elona Hoxha (+355692345678, 4.8★ rating)
- Existing appointments to show activity
- Albanian service names (Manikyr, Pedikyr, Ngjyrosje Flokësh)

**⚠️ Safety:** The seed script **refuses to run against production** databases. It checks for `imirezervimi.al` in the database URL.

### Step 2: Start Development Server

```bash
cd frontend
npm run dev
```

Verify the app is running at `http://localhost:3000` with demo data visible.

### Step 3: Record Video Footage

Record the product demo using Playwright:

```bash
npx tsx scripts/record-showcase.ts
```

**What It Does:**
- Opens Chrome with Playwright automation
- Navigates through the complete user flow:
  1. Homepage → Click "Zbulo Sallone"
  2. Salons → Browse → Click "Klea Beauty Studio"
  3. Booking → Fill form → Submit request
  4. Dashboard → View request → Approve
- Captures frames at 2880×1800 @ 30fps
- Logs all events with timestamps to `showcase/events.json`
- Human-like pointer movements and typing

**Output:** `showcase/frames/` folder with JPEG frames

### Step 4: Edit Video with Remotion

Compile the footage into polished video with browser chrome:

```bash
# Install Remotion (requires company license for commercial use)
npm install remotion

# Render final video
npx remotion render scripts/edit-showcase.tsx Showcase showcase/showcase-1920x1200.mp4 --codec h264 --crf 14
```

**What Remotion Does:**
- Adds browser window chrome (title bar, URL, window dots)
- Animates pointer with click effects
- Camera zooms during form filling and approval
- Cross-dissolve transitions between scenes
- Fade in/out at start/end for clean loop
- Renders at 1920×1200, 30fps, H.264

**⚠️ Remotion License:** Requires paid company license for companies with 3+ people. See: https://remotion.dev/license

### Step 5: Capture Gallery Screenshots

Take static screenshots for the gallery:

```bash
npx tsx scripts/capture-gallery.ts
```

**Output:** 7 PNG screenshots in `showcase/gallery/`
- 4 desktop (1600×1000)
- 3 mobile iPhone (1320×2868)

### Step 6: Extract Cover Poster

Choose the best frame from the video showing the finished result:

```bash
# Extract frame at timestamp (e.g., 28 seconds)
ffmpeg -i showcase/showcase-1920x1200.mp4 -ss 00:00:28 -vframes 1 -q:v 2 showcase/cover-poster.jpg
```

**Recommended:** Frame showing the approval success message or completed booking confirmation.

### Step 7: Verify Deliverables

Check all files are present and correct:

```bash
# Check video duration
ffprobe -i showcase/showcase-1920x1200.mp4 -show_entries format=duration -v quiet -of csv="p=0"

# Check file sizes
du -sh showcase/showcase-1920x1200.mp4
du -sh showcase/cover-poster.jpg
du -sh showcase/gallery/*.png

# Verify facts.md has all alt text
grep "Alt:" showcase/facts.md
```

**Expected:**
- Video: 25-35 seconds, ~10-20 MB
- Poster: 1920×1200 JPEG, ~500 KB - 1 MB
- Gallery: 7 PNGs, ~200-500 KB each

### Step 8: Package for Delivery

Create final ZIP archive:

```bash
# Create ZIP (excludes intermediate files)
cd showcase
zip -r ../imirezervimi-showcase.zip . -x "frames/*" -x "*.DS_Store"
cd ..
```

**Deliverable:** `imirezervimi-showcase.zip` ready to send to Tech Atlas.

## 🎨 Video Specifications

**Master Recording:**
- Resolution: 2880×1800 (2× scale for quality)
- Frame Rate: 30 fps
- Format: JPEG frames @ quality 95

**Final Video:**
- Resolution: 1920×1200
- Frame Rate: 30 fps
- Codec: H.264, CRF 14
- Audio: None
- Duration: 25-35 seconds

**Visual Style:**
- Browser window: 1600px wide, 52px title bar
- Stage background: #0a0a0a (near-black)
- Window chrome: macOS-style (red/yellow/green dots)
- Pointer: 16px white circle with shadow

## 🇦🇱 Albanian Language Notes

All UI text is in Albanian:

**Key Phrases:**
- "Rezervo te salloni yt i preferuar" - Book at your favorite salon
- "Zbulo Sallone" - Discover Salons
- "Dërgo Kërkesën" - Send Request
- "Kërkesa u dërgua!" - Request sent!
- "Aprovo" / "Refuzo" - Approve / Decline
- "Rezervimi u bë me sukses!" - Booking successful!

**Character Support:** ë, ç, Ë, Ç (Albanian special characters)

## 📝 Technical Notes

### Database Requirements
- PostgreSQL via Supabase
- Must have all tables from `database/schema.sql`
- Development or staging database only (not production)

### Browser Requirements
- Chrome/Chromium for recording (Playwright controlled)
- Display server required (cannot run headless for quality)
- 1440×900 minimum screen resolution

### Performance
- Recording takes ~2-3 minutes
- Remotion rendering: ~3-5 minutes
- Total production time: ~15-20 minutes end-to-end

## ⚠️ Common Issues

**"Browser crashed" during recording:**
- Ensure dev server is running on port 3000
- Check available display (X11/Wayland)
- Try running with `headless: false` to see browser

**"Element not found" errors:**
- Verify demo data seeded correctly
- Check selectors match your actual HTML
- Increase wait timeouts if pages load slowly

**Remotion license error:**
- Remotion requires paid license for companies with 3+ people
- Purchase at: https://remotion.dev/license
- Free for solo developers and open source

**Screenshots missing content:**
- Ensure dev server has demo data loaded
- Check viewport sizes match config
- Verify Albanian localization is active

## 🔗 Resources

- **Remotion Docs:** https://remotion.dev/docs
- **Playwright Docs:** https://playwright.dev/docs/intro
- **Supabase Docs:** https://supabase.com/docs
- **Project Roadmap:** ../ROADMAP.md
- **Showcase Plan:** ../SHOWCASE_PLAN.md

## ✅ Quality Checklist

Before delivering:

- [ ] Video is 25-35 seconds long
- [ ] Video shows complete booking flow start to finish
- [ ] All Albanian text is visible and readable
- [ ] Browser chrome is clean (no debug tools, no errors)
- [ ] Pointer movements look natural and human
- [ ] Transitions are smooth (no jarring cuts)
- [ ] Cover poster shows impactful moment
- [ ] All 7 gallery screenshots present
- [ ] No real customer data in any screenshot
- [ ] facts.md has alt text for all images
- [ ] File sizes are reasonable (<20 MB total)
- [ ] ZIP archive is under 25 MB

---

**Need help?** Check the scripts in `../scripts/` for detailed implementations.

**Questions?** Contact Tech Atlas or refer to `../SHOWCASE_PLAN.md` for original plan.
