# ImiRezervimi.al — project facts

## Product

- **Name:** ImiRezervimi.al
- **Website:** https://imirezervimi.al
- **Summary:** ImiRezervimi.al is an online booking platform for beauty salons and barbershops in Albania. Customers request an appointment from a salon's link, and the salon approves it from its dashboard, with confirmations sent on WhatsApp.

## Client

- **Client or company:** TODO
- **Industry:** Beauty and barbershop appointment booking.
- **Country:** Albania.

## Timeline and status

- **Started:** July 2025. The first commit in the repository is dated 12 July 2025.
- **Status:** Live at imirezervimi.al. Development is ongoing; the most recent work on the main branch is from July 2026.
- **Launch date:** TODO

## The brief

Albanian salons take most bookings through Instagram messages and phone calls, which means a lot of back-and-forth and a schedule kept by hand. ImiRezervimi.al gives each salon a booking link it can put in its Instagram bio. Customers pick a service, a day and a free time slot, and send a request. The salon reviews requests in one queue, approves or declines them, and the customer is notified on WhatsApp. It is built for salon and barbershop owners and for their customers, and the whole interface is in Albanian.

## What was built

- **Public website:** A home page for customers and a separate page for salon owners ("Për Sallone & Berberi") with benefits, how it works, testimonials and a free 30-day trial offer. There is also a salon directory with search.
- **Customer web app:**
  - Sign-in with Google or Facebook, with phone number verification.
  - A three-step booking flow (service, date and time, confirm) that shows only free slots.
  - A booking status page and a personal dashboard with booking history and favourite salons.
- **Salon dashboard:**
  - Passwordless sign-in through a magic link sent on WhatsApp.
  - A queue of pending requests, sorted by a customer priority score with VIP and loyal-customer badges.
  - Quick approve, approve with a note, and decline.
  - An availability calendar and working-hours settings, plus a customer details panel.
- **Notifications:** WhatsApp messages through Twilio for request confirmations, approvals and reminders.
- **Admin:** A protected admin area for reviewing and approving new salon registrations.
- **Installable web app:** The site is a progressive web app (PWA), so customers can add it to their phone's home screen. There is no native mobile app.

## Stack

- **Languages:** TypeScript and JavaScript.
- **Frameworks:** Next.js 15 (pages router), React 19, Tailwind CSS.
- **Authentication:** NextAuth.js with Google and Facebook sign-in.
- **Database:** Supabase (PostgreSQL), with row-level security policies.
- **Hosting:** Vercel, with Vercel Analytics and Speed Insights.
- **Messaging:** Twilio WhatsApp API.
- **Email:** None. The codebase has no email service.
- **Payments:** None yet. Salons start on a free 30-day trial.
- **Testing:** Playwright for end-to-end tests and Jest for unit tests.

## What comes next

TODO. The repository README lists a React Native mobile app, photo uploads, deeper analytics, multi-staff scheduling, payments, loyalty programmes, and expansion to Kosovo and North Macedonia. Confirm which of these are still planned.

## Alt text

- **cover-poster.jpg:** Browser window on a dark stage showing the "Rezervimi u dërgua!" card after booking at a salon
- **gallery/1-website.png:** ImiRezervimi.al home page with the headline "Rezervo te salloni yt i preferuar" over a salon photo
- **gallery/2-salons.png:** Salon directory with a search bar and cards for six beauty salons and barbershops across Albania
- **gallery/3-booking.png:** Booking step with a month calendar and a grid of free time slots, 14:00 selected
- **gallery/4-request-sent.png:** Confirmation card reading "Rezervimi u dërgua!" with the salon name and booking ID
- **gallery/5-salon-requests.png:** Salon dashboard with stats and a queue of pending requests, each with approve and decline buttons
