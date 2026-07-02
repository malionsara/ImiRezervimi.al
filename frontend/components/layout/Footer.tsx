// frontend/components/layout/Footer.tsx
// Standardized footer component for ImiRezervimi.al
// Ensures consistent branding and responsive design

import Link from 'next/link'
import { Mail, MessageCircle } from 'lucide-react'
import Logo from '../ui/Logo'

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface FooterProps {
  variant?: 'default' | 'salon' | 'minimal'
  className?: string
}

export default function Footer({ variant = 'default', className = '' }: FooterProps) {
  const footerConfig = {
    default: {
      tagline: 'Rezervime Online',
      description: 'Platforma e parë shqiptare për rezervime online në sallone bukurie dhe berberi.',
      sections: [
        {
          title: 'Shërbime',
          links: [
            { href: '/salons', label: 'Rezervime Online' },
            { href: '#si-funksionon', label: 'Si funksionon' },
            { href: '/salon', label: 'Për Sallone' }
          ]
        },
        {
          title: 'Mbështetje',
          links: [
            { href: 'mailto:info@imirezervimi.al', label: 'Kontakt' },
            { href: '/privacy-policy', label: 'Privatësia' },
            { href: '/terms-of-service', label: 'Kushtet e Përdorimit' }
          ]
        }
      ]
    },
    salon: {
      tagline: 'Për Sallone',
      description: 'Menaxho rezervimet e sallonit tënd në një vend — kërkesat nga Instagram, konfirmimet në WhatsApp.',
      sections: [
        {
          title: 'Për Sallone',
          links: [
            { href: '/salon/register', label: 'Regjistrohu' },
            { href: '/salon#avantazhet', label: 'Avantazhet' },
            { href: '/salon#cmimi', label: 'Çmimi' }
          ]
        },
        {
          title: 'Mbështetje',
          links: [
            { href: 'tel:+355694567890', label: '+355 69 456 7890' },
            { href: 'mailto:sallone@imirezervimi.al', label: 'sallone@imirezervimi.al' },
            { href: '/', label: 'Për Klienta' }
          ]
        }
      ]
    },
    minimal: {
      tagline: 'Rezervime Online',
      description: 'Platforma e parë shqiptare për rezervime online në sallone bukurie.',
      sections: []
    }
  }

  const config = footerConfig[variant]

  if (variant === 'minimal') {
    return (
      <footer className={`bg-sand border-t border-linen py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Logo size="sm" />
            </div>
            <p className="text-clay text-sm mb-4">{config.description}</p>
            <p className="text-clay/70 text-xs">© 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={`bg-ink text-cream ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo size="md" dark tagline={config.tagline} />
            </div>

            <p className="text-cream/60 mb-8 max-w-md leading-relaxed">
              {config.description}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 border border-cream/20 hover:border-cream/50 rounded flex items-center justify-center transition-colors duration-200"
              >
                <InstagramIcon size={18} />
              </Link>
              <Link
                href="mailto:info@imirezervimi.al"
                aria-label="Email"
                className="w-10 h-10 border border-cream/20 hover:border-cream/50 rounded flex items-center justify-center transition-colors duration-200"
              >
                <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                href="#"
                aria-label="WhatsApp"
                className="w-10 h-10 border border-cream/20 hover:border-cream/50 rounded flex items-center justify-center transition-colors duration-200"
              >
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          {config.sections.map((section, index) => (
            <div key={index}>
              <h4 className="font-display text-lg mb-5">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-cream/60 hover:text-cream text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 mt-12 pt-8 text-center">
          <p className="text-cream/50 text-sm">
            © 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.
          </p>
        </div>
      </div>
    </footer>
  )
}
