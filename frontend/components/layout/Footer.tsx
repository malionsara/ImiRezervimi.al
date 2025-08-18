// frontend/components/layout/Footer.tsx
// Standardized footer component for ImiRezervimi.al
// Ensures consistent branding and responsive design

import Link from 'next/link'
import Image from 'next/image'

interface FooterProps {
  variant?: 'default' | 'salon' | 'minimal'
  className?: string
}

export default function Footer({ variant = 'default', className = '' }: FooterProps) {
  const footerConfig = {
    default: {
      mainText: 'ImiRezervimi.al',
      tagline: 'Rezervime Online',
      description: 'Platforma e parë shqiptare për rezervime online në sallone bukurie. E bërë me ❤️ për komunitetin shqiptar.',
      stats: [
        { value: '500+', label: 'Sallone' },
        { value: '10k+', label: 'Klienta' },
        { value: '50k+', label: 'Rezervime' },
        { value: '4.9★', label: 'Vlerësim' }
      ],
      sections: [
        {
          title: 'Shërbime',
          links: [
            { href: '#', label: 'Rezervime Online' },
            { href: '#', label: 'WhatsApp Njoftimet' },
            { href: '#', label: 'Menaxhim Orari' }
          ]
        },
        {
          title: 'Mbështetje',
          links: [
            { href: '#', label: 'Kontakt' },
            { href: '#', label: 'Ndihmë' },
            { href: '/privacy-policy', label: 'Privatësia' }
          ]
        }
      ]
    },
    salon: {
      mainText: 'ImiRezervimi.al',
      tagline: 'Për Sallone',
      description: 'Platforma më e madhe e rezervimeve në Shqipëri. E bërë me ❤️ për sallone si e joja.',
      stats: [
        { value: '500+', label: 'Sallone' },
        { value: '10k+', label: 'Klienta' },
        { value: '50k+', label: 'Rezervime' },
        { value: '4.9★', label: 'Vlerësim' }
      ],
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
      mainText: 'ImiRezervimi.al',
      tagline: 'Rezervime Online',
      description: 'Platforma e parë shqiptare për rezervime online në sallone bukurie.',
      stats: [],
      sections: []
    }
  }

  const config = footerConfig[variant]

  if (variant === 'minimal') {
    return (
      <footer className={`bg-gray-50 border-t border-gray-200 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">💅</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-black text-red-600">{config.mainText.split('.')[0]}</span>
                <span className="text-lg font-black text-orange-500">.{config.mainText.split('.')[1]}</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm mb-4">{config.description}</p>
            <p className="text-gray-500 text-xs">© 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-xl">💅</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-xl font-black text-white">{config.mainText.split('.')[0]}</span>
                  <span className="text-xl font-black text-orange-400">.{config.mainText.split('.')[1]}</span>
                </div>
                <span className="text-sm text-gray-400 -mt-1">{config.tagline}</span>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              {config.description}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Link 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <span className="text-lg">📱</span>
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <span className="text-lg">📧</span>
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <span className="text-lg">💬</span>
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          {config.sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        {config.stats.length > 0 && (
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {config.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 ImiRezervimi.al. Të gjitha të drejtat e rezervuara.
          </p>
        </div>
      </div>
    </footer>
  )
}