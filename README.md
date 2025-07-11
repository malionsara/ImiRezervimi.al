# ImiRezervimi.al 💅

Albanian beauty salon booking platform - Instagram to WhatsApp appointment requests

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)

## 🎯 About

ImiRezervimi.al bridges the gap between Instagram discovery and seamless booking for Albanian beauty salons. Customers discover salons on Instagram, click bio links to request appointments, and receive WhatsApp confirmations when approved.

### The Problem
- Albanian salons get overwhelmed with Instagram DMs
- Customers struggle with back-and-forth booking messages
- No-shows and double bookings are common
- Manual appointment management with pen and paper

### The Solution
- **Instagram integration**: Direct booking from salon bio links
- **Request-based system**: Salons approve appointments with customer priority
- **WhatsApp notifications**: Instant confirmations and reminders
- **Albanian-first**: Complete localization for Albanian market

## ✨ Key Features

- 🔗 **Instagram Bio Integration** - One-click booking from salon profiles
- 📱 **WhatsApp Notifications** - Real-time confirmations and reminders
- 🇦🇱 **Albanian Localization** - Complete interface in Albanian language
- ⭐ **Smart Prioritization** - Customer ratings and revenue-based booking priority
- 📅 **Request Management** - Salons control their schedule with approval workflow
- 🚫 **Anti-Spam Protection** - Phone verification and booking limits
- 📊 **Simple Analytics** - Basic booking stats for salon owners

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Twilio account (WhatsApp API)
- Instagram Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/imirezervimi.git
   cd imirezervimi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   
   # Instagram API
   INSTAGRAM_CLIENT_ID=your_instagram_app_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_secret
   
   # Twilio WhatsApp
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_WHATSAPP_NUMBER=+14155238886
   
   # App Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Set up database**
   ```bash
   npm run db:setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
imirezervimi/
├── frontend/                 # Next.js frontend application
│   ├── pages/               # Next.js pages and API routes
│   ├── components/          # React components
│   ├── styles/              # Tailwind CSS styles
│   ├── hooks/               # Custom React hooks
│   ├── locales/             # Albanian translations
│   └── utils/               # Frontend utilities
├── backend/                 # Backend services and API
│   ├── api/                 # API route handlers
│   ├── services/            # Business logic services
│   ├── middleware/          # Authentication and validation
│   └── utils/               # Backend utilities
├── database/                # Database schemas and migrations
│   ├── schema.sql           # Database structure
│   ├── migrations/          # Schema migrations
│   └── seeds/               # Test data
├── shared/                  # Shared code between frontend and backend
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # Application constants
│   └── validations/         # Shared validation schemas
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run db:setup` - Set up database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

### Environment Setup

1. **Supabase Database**
   - Create new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `database/schema.sql`
   - Enable Row Level Security (RLS)

2. **Instagram API**
   - Create app at [developers.facebook.com](https://developers.facebook.com)
   - Add Instagram Basic Display product
   - Configure redirect URIs

3. **Twilio WhatsApp**
   - Sign up at [twilio.com](https://twilio.com)
   - Enable WhatsApp sandbox for testing
   - Request production WhatsApp approval

## 🌍 Albanian Localization

All user-facing text is in Albanian. Key phrases:

- **"Kërkesa u dërgua"** - Request sent
- **"Rezervimi u bë me sukses!"** - Booking successful
- **"Kujtesë: Nesër në 14:00"** - Reminder: Tomorrow at 14:00
- **"Klient VIP"** - VIP Customer

Translations are managed in `frontend/locales/al.json`.

## 📱 WhatsApp Message Templates

### Customer Messages
```
// Request confirmation
"Kërkesa u dërgua te {salon_name} për {date} në {time}. Do të njoftoheni brenda 2 orësh! 💅"

// Booking approved
"Rezervimi u bë me sukses! {salon_name} ju mirëpret {date} në {time} pranë sallonit të saj! ✨"

// Reminder
"Kujtesë: {date} në {time} te {salon_name}. Mos harroni! 💕"
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Configure environment variables**
   - Add all environment variables in Vercel dashboard
   - Ensure production API keys are set

3. **Custom domain**
   - Add `imirezervimi.al` domain in Vercel
   - Configure DNS settings

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

### Test Coverage
- Authentication flows
- Booking workflow
- WhatsApp integration
- Albanian text rendering
- Mobile responsiveness

## 📊 Business Model

- **Freemium model**: 3 months free trial
- **Subscription tiers**: €15-30/month per salon
- **Target market**: Albanian beauty salons
- **Revenue potential**: €270K-1.4M annually

## 🗺️ Roadmap

### Phase 1 - MVP (4 weeks)
- [x] Basic booking system
- [x] Instagram integration
- [x] WhatsApp notifications
- [x] Albanian localization

### Phase 2 - Growth (Months 2-6)
- [ ] React Native mobile app
- [ ] Photo uploads for inspiration
- [ ] Advanced analytics
- [ ] Multi-staff scheduling

### Phase 3 - Scale (Months 6-12)
- [ ] Payment processing
- [ ] Loyalty programs
- [ ] Regional expansion (Kosovo, Macedonia)
- [ ] API for third-party integrations

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

### Development Setup for Contributors
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@imirezervimi.al
- **WhatsApp**: +355 XX XXX XXXX
- **Documentation**: [docs.imirezervimi.al](https://docs.imirezervimi.al)

## 🎯 Market Focus

**Target Cities**: Tirana, Durrës, Vlorë, Shkodër
**Target Salons**: Hair, Nails, Eyebrows, Esthetics
**Customer Base**: Instagram-active Albanian women aged 18-45

---

Made with ❤️ for the Albanian beauty community

**Instagram**: [@imirezervimi](https://instagram.com/imirezervimi)
**Website**: [imirezervimi.al](https://imirezervimi.al)
